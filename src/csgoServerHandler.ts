import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import dotenv from 'dotenv';
import schedule from 'node-schedule';
import * as fileHandler from './fileHandler.js';
import { Team } from './types/event/index.js';
import { getMatchStatsFileName } from './matchConfig.js';
import { statConversion } from './conversions.js';
import chokidar from 'chokidar';
import { SeriesStats } from './types/matchStats.js';

interface Server {
    available: boolean,
    currentMatchId: string | null,
    teams: any, // TODO -> fix type for this
    matchHistory: any[], // TODO -> fix type for this
    started: boolean,
    serverAddress: string
}

dotenv.config();

const csgoServerPath = '/home/steam/csgo-multiserver';
const csgoServerPathFake = '/home/steam/fake-csgo-server'; 
const serverAddress = process.env.SERVER_ADDRESS;

if (!serverAddress) throw Error("SERVER_ADDRESS was not provided in env file");

const spawnOptions: SpawnOptions = {
    cwd:  process.argv.includes('fake') ? csgoServerPathFake : csgoServerPath,
    stdio: ['inherit'], // attatch tty (csgo-multiserver requirement)
    windowsVerbatimArguments: true,
};

const servers: Record<string, Server> = {};

for (var i = 1; i <= 5; i++) { 
  servers['csgo'+ i] = {
    available: true,
    currentMatchId: null,
    teams: null,
    matchHistory: [],
    started: false,
    serverAddress: `${serverAddress}:${27014+i}`,
  }
}
let isServerUpdating = false;

/**
* This function will check for updates on csgo servers every day at 10:07:10 if
* there is one update it will update it.
*/
schedule.scheduleJob('10 7 10 * * *', checkIfUpdateNeeded);

export function checkIfUpdateNeeded(){
    try {
        isServerUpdating = true;
        console.log('Updating server');
        const updateProcess = spawn('./csgo-server', ['update'], spawnOptions);
        updateProcess.on('close', () => { // when update is done
            isServerUpdating = false;
        })
    } catch(e){
        console.log('Failed to update!', e);
    }
}

export function serverUpdating() {
    return isServerUpdating;
}

export function getServerAddress(matchId: string) {
    const serverId = getServerId(matchId);
    return servers[serverId].serverAddress;
}

export function setMatchId(serverId: string, matchId: string) {
    servers[serverId].currentMatchId = matchId;
}

export function clearMatchId(serverId: string) {
    servers[serverId].currentMatchId = null;
}

export function getMatchId(serverId: string) {
    return servers[serverId].currentMatchId;
}

export function getServerId(matchId: string) {
    const serverId = Object.keys(servers).find(key => servers[key].currentMatchId === matchId)

    if (!serverId) throw Error(`No server for matchId: ${matchId}`)

    return serverId
}

export function setMatchStarted(matchId: string) {
    for (var serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId == matchId) {
            servers[serverId].started = true;
        }
    }
}

export function getAvailableServer() {
    var keys = Object.keys(servers);
    for (var i = 0; i < keys.length; i++) {
        var serverId = keys[i];
        if (servers[serverId].available) {
            servers[serverId].available = false;
            return serverId;
        }
    }
    return null;
}

// Creates match
export function startNewMatch(matchData: any) { //TODO -> Add interface for matchData
    const serverId = getAvailableServer();
    if (serverId === null) {
        console.log('No available servers')
        return null;
    }
   
    const matchId = matchData.matchId;
    setTeams(serverId, matchData.team1, matchData.team2)
    console.log('Created match ' + matchId)
    try {
        fileHandler.createMatchCfg(matchData, serverId);
    } catch(error) {
        console.log(error);
        throw 'Could not start match';
    }
    
    setMatchId(serverId, matchId);
    startCSGOServer(serverId);
   
    setTimeout(function() {
        if (servers[serverId].currentMatchId === matchId && 
                !servers[serverId].started) {
            console.log('Server turned off since match did not start');
            stopCSGOServer(serverId);
        }
    }, 6*60*1000); // stop if not started in 6 minutes

    return matchId;

}

function setTeams(serverId: string, team1: any, team2: any) { // TODO -> add interface for team1 and team2
    if (team1.teamName === team2.teamName) {
        team1.teamName = `${team1.teamName} 1`;
        team2.teamName = `${team2.teamName} 2`;
    }

    servers[serverId].teams = { team1, team2 }
}

// TODO -> test this
export function getTeamId(matchId: string, team: Team) {
    const serverId = getServerId(matchId)

    if (servers[serverId]) {
        return servers[serverId].teams[team].teamId
    }
} 


export function getPlayers(matchId: string, team: Team) {
    const serverId = getServerId(matchId)

    return servers[serverId].teams[team].players
}

export function startMatch(matchId: string) {
    const serverId = getServerId(matchId)
    //TODO -> send a chat message that the match will start in x seconds.
    // look at basechat.sp
    // sm_csay Sends a centered message to all players.
    const forceReadyCmd = spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_forceready'], spawnOptions);

    forceReadyCmd.on("close", () => {
        console.log('set all players ready');
    })
}

//Stop ongoing match
export function stopMatch(matchId: string) {
    console.log('stopping match');
    for (const serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId === matchId) {
            stopCSGOServer(serverId);
            clearMatchId(serverId);
        }
    }
}

export function finishMatch(serverId: string) {
    stopCSGOServer(serverId);
    clearMatchId(serverId);
}

// TODO -> Handle error?
export function sendAlertMessage(matchId: string, message: string) {
    const serverId = getServerId(matchId);
    const csayCmd =  spawn('./csgo-server',  ['@'+ serverId, 'exec', 'sm_csay', message], spawnOptions);
}

//Sends command for starting the server.
export function startCSGOServer(serverId: string) {
    let stop: ChildProcess;
    let start: ChildProcess;

    //serverUpdating();

    try {
        console.log('Stopping server');
        stop = spawn('./csgo-server', ['@' + serverId, 'stop'], spawnOptions);

        stop.on('close', () => { // when stop command is done
            try{
                console.log('Starting server');
                start = spawn('./csgo-server', ['@' + serverId, 'start'], spawnOptions);
            } catch(e){
                console.log('Failed to start server!', e);
            }
    
            start.on('close', () => { // when start command is done
                setTimeout(() => {
                    try {
                        console.log('Starting get5');
                        const load = spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_loadmatch', 'match.json'], spawnOptions);
                        
                        load.on('close', () => {
                            console.log(`started server: ${serverId}`);
                        })
                        load.on('error', (error) => {
                            console.log(error);
                        })
                    } catch(e) {
                        console.log('Server did not start!', e);
                    }
                }, 1000);
            });
        });
    } catch(e){
        console.log('Failed to stop server!', e);
    }

    
}

export function endMatch(serverId: string) {
    try{
        spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_endmatch'], spawnOptions);
    } catch(e){
        console.log('Failed to end match', e);
    }
}

//Sends commands for stopping server
export function stopCSGOServer(serverId: string) {
    try {
        const matchId = getMatchId(serverId)
        
        if (!matchId) throw `No match id for server: ${serverId}`

        const millisecondsToShutdown = 10000

        sendAlertMessage(matchId, `Server shutting down in ${millisecondsToShutdown/1000} seconds`)
        setTimeout(() => {
            console.log('Stopping server');
            spawn('./csgo-server', ['@' + serverId, 'stop'], spawnOptions);
            servers[serverId].available = true;
            servers[serverId].started = false;
            servers[serverId].currentMatchId = null; 
            servers[serverId].teams = null;
        }, millisecondsToShutdown)
        
    } catch(e){
        console.log('Failed to stop server!', e);
    }
}

/**
 * The dumpFile option only works if a match is running.
 */
export function getMatchStats({matchId, dumpFile = false}: {matchId: string, dumpFile?: boolean}) {
    return new Promise<SeriesStats>((resolve, reject) => {
        const serverId = getServerId(matchId);
        const statsFileName = getMatchStatsFileName(matchId)
        const matchStatsPath = `${fileHandler.USER_DIR}csgo@${serverId}/csgo/${statsFileName}`
        
        const getStats = async () => {
            try {
                const seriesStatsRaw = await fileHandler.getResultFromJsonFile(matchStatsPath)
                const seriesStats = statConversion.seriesStats(matchId, seriesStatsRaw)
                resolve(seriesStats)
            } catch (error) {
                reject(error)
            }
        }

        if (dumpFile)  {
            const watcher = chokidar.watch(matchStatsPath)
            spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_dumpstats', statsFileName], spawnOptions);

            const abortTimeout = setTimeout(() => {
                watcher.close();
                console.log("Watching for file changes took too long, aborting");
            }, 3000)

            watcher.on("change", () => {
                watcher.close();
                clearTimeout(abortTimeout)
                setTimeout(() => {
                    getStats()
                }, 1000)
            })
        } else {
            getStats();
        }
    })
}


