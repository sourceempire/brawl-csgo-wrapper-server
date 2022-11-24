import { getJoinLink, getTeamId } from './csgoServerHandler.js';
import { finishMatch } from './csgoServerHandler.js';
import { getServerId } from './csgoServerHandler.js';
import { moveJsonMatchFileToBackupLocation } from './fileHandler.js';
import { getResultFromJsonFile } from './fileHandler.js';
import { USER_DIR } from './fileHandler.js';

import {Connection} from "sockjs";

const sockets: Connection[] = [];
const unsentEvents: any[] = []; // TODO -> create type for unsentEvents

function _sendEvent(event: any, data: any) { // TODO -> create type for event and data
  let toSend = {...data, event: event};
  if (sockets.length !== 0) {
    for (let socket of sockets) {
      socket.write(JSON.stringify(toSend));
    }
    
  } else {
    unsentEvents.push(toSend);
  }
}

export function addSocket(connection: Connection) {
  sockets.push(connection);
  for (let event of unsentEvents) {
    _sendEvent(event.event, event);
  }
}

export function clearSocket(connection: Connection) {
  for (var i = sockets.length-1; i >= 0; i--) {
    if (sockets[i] === connection) {
       sockets.splice(i, 1);
    }
  }  
}

export function sendSeriesStartEvent(event: any) { // TODO -> refactor acording to new get5 update
  _sendEvent('series_start', {
    matchid: event.matchid,
    event: event.event,
    joinLink: getJoinLink(event.matchid),
  });
}

export function sendGoingLiveEvent(event: any) { // TODO -> refactor acording to new get5 update
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

export function sendPlayerDeathEvent(event: any) { // TODO -> refactor acording to new get5 update
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('player_death', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  });
}

export function sendBombPlantedEvent(event: any) { // TODO -> refactor acording to new get5 update
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_planted', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  });
}

export function bombDefusedEvent(event: any) { // TODO -> refactor acording to new get5 update
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_defused', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  })
}

export function bombExplodedEvent(event: any) { // TODO -> refactor acording to new get5 update
  const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  _sendEvent('bomb_exploded', {
    ...upperCaseParams,
    matchid: event.matchid,
    event: event.event,
  })
}

export function roundEndEvent(event: any) { // TODO -> refactor acording to new get5 update
  // const teams = Object.keys(event.params.teams)
  //   .reduce((acc, paramKey) => {
  //     const teamId = getTeamId(event.matchid, paramKey);
  //     acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
  //     return acc
  //   }, {});

  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  // delete upperCaseParams.teams;

  // _sendEvent('round_end', {
  //   ...upperCaseParams,
  //   teams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}

export function sideSwapEvent(event: any) { // TODO -> refactor acording to new get5 update
  // const teams = Object.keys(event.params.teams)
  //   .reduce((acc, paramKey) => {
  //     const teamId = getTeamId(event.matchid, paramKey);
  //     acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
  //     return acc
  //   }, {});

  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  // delete upperCaseParams.teams;

  // _sendEvent('side_swap', {
  //   ...upperCaseParams,
  //   teams,
  //   matchid: event.matchid,
  //   event: event.event
  // })
}

export function mapEndEvent(event: any) { // TODO -> refactor acording to new get5 update
  // const teams = Object.keys(event.params.teams)
  //   .reduce((acc, paramKey) => {
  //     const teamId = getTeamId(event.matchid, paramKey);
  //     acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
  //     return acc
  //   }, {});

  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  // delete upperCaseParams.teams;

  // _sendEvent('map_end', {
  //   ...upperCaseParams,
  //   teams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}

export async function seriesEndEvent(event: any) { // TODO -> refactor acording to new get5 update
  const serverId = getServerId(event.matchid);

  if (!serverId) throw Error("serverId was not found")

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

// NOT USED ANYMORE, should probably be though
export function sendMatchError(error: any) { // TODO -> create interface for error, whatever it is
  _sendEvent('match-error', { error });
}

function setSeriesData(matchid: string, matchResult: any) { // TODO -> create interface for matchResult
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

function setMapsData(matchid: string, matchResult: any) { // TODO -> create interface for matchResult
  const { team1_name, team2_name } = matchResult;
  const team1Id = getTeamId(matchid, team1_name);
  const team2Id = getTeamId(matchid, team2_name);

  const maps: any[] = [] //TODO -> Create interface for maps?

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
              // players: {
              //   ...Object.keys(matchResult[mapKey].team1)
              //     .filter((key) => key !== 'score')
              //     .reduce((acc, key) => {
              //       acc[key] = convertObjectKeysToUpperCase(matchResult[mapKey].team1[key]);
              //       return acc;
              //     }, {})
              // },
            },
            [team2Id]: {
              score: matchResult[mapKey].team2.score,
              // players: {
              //   ...Object.keys(matchResult[mapKey].team2)
              //     .filter((key) => key !== 'score')
              //     .reduce((acc, key) => {
              //       acc[key] = convertObjectKeysToUpperCase(matchResult[mapKey].team2[key]);
              //       return acc;
              //     }, {})
              // },
            },
          },
        };

        maps.push(map);
      }
    })

  matchResult.maps = maps;
}

function removeUnnecessaryData(matchResult: any) { // TODO -> lets see if we can come up with something better
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

// TODO -> Lets see if this is still needed
function convertObjectKeysToUpperCase(object: Record<string, any>) { // TODO -> Fix any
  return Object.keys(object)
  .reduce((acc, param) => {
    const paramNameSplit = param.split('_');
    const uppercaseParamName = paramNameSplit.map((p, index) => index == 0 ? p : capitalizeFirstLetter(p)).join('');
    acc[uppercaseParamName] = object[param];
    return acc
  }, {} as {[key: string]: any}) // TODO -> Fix any
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
