import { spawn } from 'child_process';
import { watchForResult, stopWatchForResult } from './fileWatch.mjs';

import * as fileHandler from './fileHandler.mjs';
import * as matchHandler from './matchHandler.mjs';
import * as eventListener from './eventListener.mjs';
import schedule from 'node-schedule';

import { logAddressPort } from './constants.mjs';

const csgoServerPath = '/home/steam/csgo-multiserver';
const csgoServerPathFake = '/home/steam/fake-csgo-server'; 
const serverAddress = process.env.SERVER_ADDRESS;


//NEEDS TO HAVE A SPACE AT THE END TO BE DOUBLE QUOTED IN TERMINAL.
const logaddress = 'http://localhost:'+logAddressPort+'/csgolog ';


const spawnOptions = {
  //Change this to csgoServerPath to start real games*/
    cwd:  process.argv.includes('fake') ? csgoServerPathFake : csgoServerPath,
    stdio: ['inherit'], // attatch tty (csgo-multiserver requirement)
    windowsVerbatimArguments: true,
};


var servers = {};
for (var i = 1; i <= 5; i++) { 
  servers['csgo'+ i] = {
    available: true,
    currentMatchId: null,
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

//Building the right link for a specific server
export function buildSteamJoinLink(serverAddress,port) {
    return 'steam://connect/'+serverAddress+':'+port;
}

//Returns the complete link
export function getJoinLink(matchId) {
    for (var serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId == matchId) {
            return servers[serverId].joinLink;
        }
    }
}

//Sets a matchId to server called when match starts.
export function setMatchId(serverId, matchId) {
    servers[serverId].currentMatchId = matchId;
}

//Clears a servers matchId function called when match is over.
export function clearMatchId(serverId) {
    servers[serverId].currentMatchId = null;
}

//Get function that returns a specific servers matchId.
export function getMatchId(serverId) {
    return servers[serverId].currentMatchId;
}

export function setMatchStarted(matchId) {
    for (var serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId == matchId) {
            servers[serverId].started = true;
        }
    }
}

//Get function that returns id of first available server.
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

//Creates match
export function startNewMatch(matchData) {
    const serverId = getAvailableServer();
    if (serverId === null) {
        return null;
    }
    const matchId = matchHandler.newMatch(matchData.matchid);
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
    watchForResult(serverId, matchId, (pathToResultFile) => {
        console.log('finished match')
        onResultCreated(serverId, pathToResultFile);
    });

    setTimeout(function() {
        if (servers[serverId].currentMatchId === matchId && 
                !servers[serverId].started) {
            console.log('Server turned off since match did not start');
            stopCSGOServer(serverId);
        }
    }, 6*60*1000); // stop if not started in 6 minutes

    return matchId;

}

//Stop ongoing match
export function stopMatch(matchId) {
    console.log('stopping match');
    for (const serverId of Object.keys(servers)) {
        if (servers[serverId].currentMatchId === matchId) {
            console.log('server id: ' + serverId);
            stopCSGOServer(serverId);
            stopWatchForResult(serverId);
            clearMatchId(serverId);
        }
    }
}

//Creates match result file.
function onResultCreated(serverId, pathToResultFile) {
    fileHandler.getResultFromFile(pathToResultFile).then(result => {
        finishMatch(serverId, result);
    }).catch(err => {
        console.log('Could not read result file', err);
    });
}
//After match is finished match history is send, matchId is cleared and server is stopped.
function finishMatch(serverId, result) {
    servers[serverId].matchHistory.push(result);

    var matchId = getMatchId(serverId);
	
    matchHandler.setMatchResult(matchId, result);
    clearMatchId(serverId);
    stopCSGOServer(serverId);
    stopWatchForResult(serverId);
    eventListener.sendMatchResult(matchId, matchHandler.getMatchResultFormated(matchId));

    // Move files to backup location
    // Delete unnecessary files
    fileHandler.moveMatchFiles(serverId, matchId);
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
                    const load = spawn('./csgo-server',  ['@'+ serverId, 'exec', 'get5_loadmatch', 'match.cfg'], spawnOptions);
                    
                    load.on('close', () => {
                        spawn('./csgo-server',  ['@'+ serverId, 'exec', 'logaddress_add_http', logaddress], spawnOptions);
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
        }, 15*1000);

    } catch(e){
        console.log('Failed to stop server!', e);
    }
}
