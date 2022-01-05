import { getServerId } from './csgoServerHandler.mjs';
import { moveJsonMatchFileToBackupLocation } from './fileHandler.mjs';
import { getResultFromJsonFile } from './fileHandler.mjs';
import { USER_DIR } from './fileHandler.mjs';

const sockets = [];
const unsentEvents = [];

function _sendEvent(event, data) {
  let toSend = {...data, event: event};
  if (sockets.length !== 0) {
    for (let socket of sockets) {
      socket.write(JSON.stringify(toSend));
    }
    
  } else {
    unsentEvents.push(toSend);
  }
}

export function addSocket(s) {
  sockets.push(s);
  for (let event in unsentEvents) {
    _sendEvent(event.event, event);
  }
}

export function clearSocket(conn) {
  for (var i = sockets.length-1; i >= 0; i--) {
    if (sockets[i] === conn) {
       sockets.splice(i, 1);
    }
  }  
}

export function sendMatchResult(matchId, result) {
  _sendEvent('match-result', {match_id: matchId, result: result});
}

export function sendSeriesStartEvent(event) {
  _sendEvent('series_start', event)
}

export function sendGoingLiveEvent(event) {
  _sendEvent('going_live', event)
}

export function sendPlayerEvent(event) {
  _sendEvent('player_death', event)
}

export function sendBombPlantedEvent(event) {
  _sendEvent('bomb_planted', event)
}

export function bombDefusedEvent(event) {
  _sendEvent('bomb_defused', event)
}

export function bombExplodedEvent(event) {
  _sendEvent('bomb_exploded', event)
}

export function roundEndEvent(event) {
  _sendEvent('round_end', event)
}

export function sideSwapEvent(event) {
  _sendEvent('side_swap', event)
}

export function mapEndEvent(event) {
  _sendEvent('map_end', event)
}

export async function seriesEndEvent(event) {
  const serverId = getServerId(event.matchid);
  const matchResultPath = `${USER_DIR}csgo@${serverId}/csgo/${event.params.match_result_file}`;
  
  try {
    const matchResult = await getResultFromJsonFile(matchResultPath)
    
    removeUnfinishedMaps(matchResult)
    setSeriesWinner(matchResult);
    setSeriesScore(matchResult);
    setMapWinners(matchResult);
    replaceStaticWithRealTeamNames(matchResult);
    removeUnnecessaryData(matchResult);
  
    const matchEvent = {
      match_id: event.matchid,
      result: matchResult,
    }
  
    _sendEvent('series_end', matchEvent)
  
    moveJsonMatchFileToBackupLocation(serverId, event.matchid)
  } catch (error) {
    console.log(error);
  }
}

export function sendMatchError(error) {
  _sendEvent('match-error', { error });
}

function setSeriesWinner(matchResult) {
  const { winner, team1_name, team2_name } = matchResult
  
  if (winner === 'team1') {
    matchResult.series_winner = team1_name;
  } else if (winner === 'team2') {
    matchResult.series_winner = team2_name;
  }

  delete matchResult.winner;
}

function setSeriesScore(matchResult) {
  const { team1_name, team2_name } = matchResult

  let team1SeriesScore = 0;
  let team2SeriesScore = 0;

  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach((mapKey) => {
      if (matchResult[mapKey].winner === 'team1') team1SeriesScore++;
      if (matchResult[mapKey].winner === 'team2') team2SeriesScore++;
    })
  
  matchResult.series_score = {
    [team1_name]: team1SeriesScore,
    [team2_name]: team2SeriesScore,
  }
}

function setMapWinners(matchResult) {
  const { team1_name, team2_name } = matchResult

  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach((mapKey) => {
      if (matchResult[mapKey].winner === 'team1') {
        matchResult[mapKey].map_winner = team1_name
      } else if (matchResult[mapKey].winner === 'team2') {
        matchResult[mapKey].map_winner = team2_name
      }

      delete matchResult[mapKey].winner;
    })
}

function replaceStaticWithRealTeamNames(matchResult) {
  const { team1_name, team2_name } = matchResult;
  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach((mapKey) => {
      matchResult[mapKey][team1_name] = matchResult[mapKey].team1;
      matchResult[mapKey][team2_name] = matchResult[mapKey].team2;

      delete matchResult[mapKey].team1;
      delete matchResult[mapKey].team2;
    })
}

function removeUnnecessaryData(matchResult) {
  delete matchResult.team1_name;
  delete matchResult.team2_name;
  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach((mapKey) => {
      console.log(mapKey)
      if (matchResult[mapKey].demo_filename === '') {
        delete matchResult[mapKey].demo_filename
      }
    })
}

// This might be removed if we can figured out how to not get unfinished maps added to the result file. 
// (Probably by modifying get5 file, removing the map picker after the last map)
function removeUnfinishedMaps(matchResult) {
  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach(mapKey => {
      if (matchResult[mapKey].winner) return
      delete matchResult[mapKey]
    })
}
