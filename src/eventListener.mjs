import { getTeamId } from './csgoServerHandler.mjs';
import { finishMatch } from './csgoServerHandler.mjs';
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

export function sendSeriesStartEvent(event) {
  _sendEvent('series_start', {
    matchid: event.matchid,
    event: event.event,
  });
}

export function sendGoingLiveEvent(event) {
  _sendEvent('going_live', {
    matchid: event.matchid,
    event: event.event,
    teamSides: {
      T: getTeamId(event.matchid, event.params.team_sides.T),
      CT: getTeamId(event.matchid, event.params.team_sides.CT)
    },
    mapNumber: event.params.map_number,
    mapName: event.params.map_name,
  });
}

export function sendPlayerDeathEvent(event) {
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('player_death', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  });
}

export function sendBombPlantedEvent(event) {
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_planted', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  });
}

export function bombDefusedEvent(event) {
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_defused', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  })
}

export function bombExplodedEvent(event) {
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_exploded', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  })
}

export function roundEndEvent(event) {
  const teams = Object.keys(event.params.teams)
    .reduce((acc, paramKey) => {
      const teamId = getTeamId(event.matchid, paramKey);
      acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
      return acc
    }, {});

  const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  delete upperCaseParams.teams;

  _sendEvent('round_end', {
    ...upperCaseParams,
    teams,
    matchid: event.matchid,
    event: event.event,
  })
}

export function sideSwapEvent(event) {
  const teams = Object.keys(event.params.teams)
    .reduce((acc, paramKey) => {
      const teamId = getTeamId(event.matchid, paramKey);
      acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
      return acc
    }, {});

  const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  delete upperCaseParams.teams;

  _sendEvent('side_swap', {
    ...upperCaseParams,
    teams,
    matchid: event.matchid,
    event: event.event
  })
}

export function mapEndEvent(event) {
  const teams = Object.keys(event.params.teams)
    .reduce((acc, paramKey) => {
      const teamId = getTeamId(event.matchid, paramKey);
      acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
      return acc
    }, {});

  const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  delete upperCaseParams.teams;

  _sendEvent('map_end', {
    ...upperCaseParams,
    teams,
    matchid: event.matchid,
    event: event.event,
  })
}

export async function seriesEndEvent(event) {
  const serverId = getServerId(event.matchid);
  const matchResultPath = `${USER_DIR}csgo@${serverId}/csgo/${event.params.match_result_file}`;
  
  try {
    const matchResult = await getResultFromJsonFile(matchResultPath)
    
    setSeriesData(event.matchid, matchResult);
    setMapsData(event.matchid, matchResult);
    removeUnnecessaryData(matchResult);
  
    const matchEvent = {
      matchid: event.matchid,
      result: matchResult,
    }
  
    _sendEvent('series_end', matchEvent)
  
    moveJsonMatchFileToBackupLocation(serverId, event.matchid)
    finishMatch(serverId, matchResult)
    
  } catch (error) {
    console.log(error);
  }
}

export function sendMatchError(error) {
  _sendEvent('match-error', { error });
}

function setSeriesData(matchid, matchResult) {
  const { winner, team1_name, team2_name } = matchResult
  const team1Id = getTeamId(matchid, team1_name);
  const team2Id = getTeamId(matchid, team2_name);

  matchResult.seriesType = matchResult.series_type;
  matchResult.seriesWinner = (winner === 'team1') ? team1Id : team2Id;
  matchResult.seriesLoser = (winner === 'team1') ? team2Id : team1Id;

  let team1SeriesScore = 0;
  let team2SeriesScore = 0;

  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .forEach((mapKey) => {
      if (matchResult[mapKey].winner === 'team1') team1SeriesScore++;
      if (matchResult[mapKey].winner === 'team2') team2SeriesScore++;
    })
  
  matchResult.seriesScore = {
    [team1Id]: team1SeriesScore,
    [team2Id]: team2SeriesScore,
  }
}

function setMapsData(matchid, matchResult) {
  const { team1_name, team2_name } = matchResult;
  const team1Id = getTeamId(matchid, team1_name);
  const team2Id = getTeamId(matchid, team2_name);

  const maps = []

  Object.keys(matchResult)
    .filter((key) => key.includes('map'))
    .sort() // makes map0 to always be first, map1 second, and so on, since more then 10 maps never will be played there will never be a problem with map13 for example coming after map1.
    .forEach((mapKey) => {
      // No need to add unfinished maps to match result.
      if (matchResult[mapKey].winner) {
        const map = {
          mapName: matchResult[mapKey].mapname,
          mapWinner: matchResult[mapKey].winner === 'team1' ? team1Id : team2Id,
          mapLoser: matchResult[mapKey].winner === 'team1' ? team2Id : team1Id,
          teams: {
            [team1Id]: {
              score: matchResult[mapKey].team1.score,
              players: {
                ...Object.keys(matchResult[mapKey].team1).filter((key) => key !== 'score').reduce((acc, key) => {
                  acc[key] = convertObjectKeysToUpperCase(matchResult[mapKey].team1[key]);
                  return acc;
                }, {})
              },
            },
            [team2Id]: {
              score: matchResult[mapKey].team2.score,
              players: {
                ...Object.keys(matchResult[mapKey].team2).filter((key) => key !== 'score').reduce((acc, key) => {
                  acc[key] = convertObjectKeysToUpperCase(matchResult[mapKey].team2[key]);
                  return acc;
                }, {})
              },
            },
          },
        };

        maps.push(map);
      }
    })

  matchResult.maps = maps;
}

function removeUnnecessaryData(matchResult) {
  delete matchResult.team1_name;
  delete matchResult.team2_name;
  delete matchResult.series_type;
  // Never more than 5 maps;
  delete matchResult.map0;
  delete matchResult.map1;
  delete matchResult.map2;
  delete matchResult.map3;
  delete matchResult.map4;

  delete matchResult.winner;
}

function convertObjectKeysToUpperCase(object) {
  return Object.keys(object)
  .reduce((acc, param) => {
    const paramNameSplit = param.split('_');
    const uppercaseParamName = paramNameSplit.map((p, index) => index == 0 ? p : capitalizeFirstLetter(p)).join('');
    acc[uppercaseParamName] = object[param];
    return acc
  }, {})
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
