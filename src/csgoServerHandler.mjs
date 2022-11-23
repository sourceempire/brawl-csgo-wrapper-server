import { spawn } from 'child_process';
import dotenv from 'dotenv';

import * as fileHandler from './fileHandler.mjs';
import * as matchHandler from './matchHandler.mjs';
import schedule from 'node-schedule';

// import { logAddressPort } from './constants.mjs';

dotenv.config();

const csgoServerPath = '/home/steam/csgo-multiserver';
const csgoServerPathFake = '/home/steam/fake-csgo-server'; 
const serverAddress = process.env.SERVER_ADDRESS;

const spawnOptions = {
    cwd:  process.argv.includes('fake') ? csgoServerPathFake : csgoServerPath,
    stdio: ['inherit'], // attatch tty (csgo-multiserver requirement)
    windowsVerbatimArguments: true,
};

var servers = {};
for (var i = 1; i <= 5; i++) { 
  servers['csgo'+ i] = {
    available: true,
    currentMatchId: null,
    teams: null,
    matchHistory: [],
    started: false,
    joinLink: buildSteamJoinLink(serverAddress, 27014+i)
  }
}
var isServerUpdating = false;

/**
* This function will check for updates on csgo servers every day at 10:07:10 if
* there is one update it will update it.
*/
schedule.scheduleJob('10 7 10 * * *', checkIfUpdateNeeded);

export function checkIfUpdateNeeded(){
    try{
        isServerUpdating = true;
        console.log('Updating server');
        var updateProcess = spawn('./csgo-server', ['update'], spawnOptions);
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

export function buildSteamJoinLink(serverAddress,port) {
    return 'steam://connect/'+serverAddress+':'+port;
}

export function getJoinLink(matchId) {
    for (var serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId == matchId) {
            return servers[serverId].joinLink;
        }
    }
}

export function setMatchId(serverId, matchId) {
    servers[serverId].currentMatchId = matchId;
}

export function clearMatchId(serverId) {
    servers[serverId].currentMatchId = null;
}

export function getMatchId(serverId) {
    return servers[serverId].currentMatchId;
}

export function getServerId(matchId) {
    return Object.keys(servers).find(key => servers[key].currentMatchId === matchId)
}

export function setMatchStarted(matchId) {
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
export function startNewMatch(matchData) {
    const serverId = getAvailableServer();
    if (serverId === null) {
        console.log('No available servers')
        return null;
    }
    const matchId = matchHandler.newMatch(matchData.matchid);
    setTeams(serverId, matchData.team1, matchData.team2)
    console.log('Created match ' + matchId)
    try {
        fileHandler.createMatchCfg(matchData, serverId, matchId);
    } catch(error) {
        matchHandler.cancelMatch(matchId);
        console.log(error);
        throw 'Could not start match';
    }
    startCSGOServer(serverId);
    setMatchId(serverId, matchId);
    

    setTimeout(function() {
        if (servers[serverId].currentMatchId === matchId && 
                !servers[serverId].started) {
            console.log('Server turned off since match did not start');
            stopCSGOServer(serverId);
        }
    }, 6*60*1000); // stop if not started in 6 minutes

    return matchId;

}

function setTeams(serverId, team1, team2) {
    if (team1.teamName === team2.teamName) {
        team1.teamName = `${team1.teamName} 1`;
        team2.teamName = `${team2.teamName} 2`;
    }

    servers[serverId].teams = { team1, team2 }
}

// TODO -> needs to take in team1 or team2 instead of teamName.
export function getTeamId(matchId, teamName) {
    const serverId = getServerId(matchId)
    if (servers[serverId]) {
        return Object.values(servers[serverId].teams).find(team => team.teamName === teamName).teamId
    }
} 

//Stop ongoing match
export function stopMatch(matchId) {
    console.log('stopping match');
    for (const serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId === matchId) {
            console.log('server id: ' + serverId);
            stopCSGOServer(serverId);
            clearMatchId(serverId);
        }
    }
}

//After match is finished match history is send, matchId is cleared and server is stopped.
export function finishMatch(serverId, result) {
    servers[serverId].matchHistory.push(result);
    clearMatchId(serverId);
    stopCSGOServer(serverId);
}

//Sends command for starting the server.
export function startCSGOServer(serverId) {
    var stop;
    var start;
    //serverUpdating();
    try{
        console.log('Stopping server');
        stop = spawn('./csgo-server', ['@' + serverId, 'stop'], spawnOptions);
    } catch(e){
        console.log('Failed to stop server!', e);
    }

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
                        console.log('started match');
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
}

export function endMatch(serverId) {
    try{
        spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_endmatch'], spawnOptions);
    } catch(e){
        console.log('Failed to end match', e);
    }
}

//Sends commands for stopping server
export function stopCSGOServer(serverId) {
    try{
        setTimeout(function() {
            console.log('Stopping server');
            spawn('./csgo-server', ['@' + serverId, 'stop'], spawnOptions);
            servers[serverId].available = true;
            servers[serverId].started = false;
            servers[serverId].currentMatchId = null; 
            servers[serverId].teams = null;   
        }, 15*1000);

    } catch(e){
        console.log('Failed to stop server!', e);
    }
}
