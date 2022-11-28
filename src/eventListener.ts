import { getJoinLink, getTeamId } from './csgoServerHandler.js';
import { finishMatch } from './csgoServerHandler.js';
import { getServerId } from './csgoServerHandler.js';
import { moveJsonMatchFileToBackupLocation } from './fileHandler.js';
import { getResultFromJsonFile } from './fileHandler.js';
import { USER_DIR } from './fileHandler.js';
import * as serverHandler from './csgoServerHandler.js';

import {Connection} from "sockjs";

import { BombDefusedEvent, BombExplodedEvent, BombPlantedEvent, Get5Event, Get5EventName, GoingLiveEvent, MapResultEvent, MatchId, Player, PlayerConnectedEvent, PlayerDeathEvent, RoundEndEvent, SeriesInitEvent, SeriesResultEvent, Team } from './types/event/index.js';
import { SteamID } from './types/config/index.js';
import { match } from 'assert';

const sockets: Connection[] = [];
const unsentEvents: any[] = []; // TODO -> create type for unsentEvents
const connectedPlayers: Record<MatchId, SteamID[]> = {}

function sendEvent(event: any, data: any) { // TODO -> create type for event and data
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
    sendEvent(event.event, event);
  }
}

export function clearSocket(connection: Connection) {
  for (var i = sockets.length-1; i >= 0; i--) {
    if (sockets[i] === connection) {
       sockets.splice(i, 1);
    }
  }  
}

export function handleSeriesStartEvent(event: SeriesInitEvent) { // TODO -> refactor acording to new get5 update
  sendEvent('series_start', {
    matchid: event.matchid,
    event: event.event,
    joinLink: getJoinLink(event.matchid),
  });
}

export function handleGoingLiveEvent(event: GoingLiveEvent) { // TODO -> refactor acording to new get5 update
  serverHandler.setMatchStarted(event.matchid);
  // sendEvent('going_live', {
  //   matchid: event.matchid,
  //   event: event.event,
  //   teamSides: {
  //     T: getTeamId(event.matchid, event.params.team_sides.T),
  //     CT: getTeamId(event.matchid, event.params.team_sides.CT)
  //   },
  //   mapNumber: event.params.map_number,
  //   mapName: event.params.map_name,
  // });
}

function handlePlayerConnectedEvent(event: PlayerConnectedEvent) {
  console.log({event})

  if (!connectedPlayers[event.matchid]) {
    connectedPlayers[event.matchid] = []
  }

  connectedPlayers[event.matchid].push(event.player.steamid)

  const team1Players = serverHandler.getPlayers(event.matchid, Team.TEAM1)
  const team2Players = serverHandler.getPlayers(event.matchid, Team.TEAM2)

  const isTeam1Connected = team1Players.every((steamId) => connectedPlayers[event.matchid].includes(steamId))
  const isTeam2Connected = team1Players.every((steamId) => connectedPlayers[event.matchid].includes(steamId))

  console.log({team1Players, team2Players, isTeam1Connected, isTeam2Connected})

  if (isTeam1Connected && isTeam2Connected) {
    serverHandler.startMatch(event.matchid)
  }
}

export function handlePlayerDeathEvent(event: PlayerDeathEvent) { // TODO -> refactor acording to new get5 update
  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  // sendEvent('player_death', {
  //   ...upperCaseParams,
  //   matchid: event.matchid,
  //   event: event.event,
  // });
}

export function handleBombPlantedEvent(event: BombPlantedEvent) { // TODO -> refactor acording to new get5 update
  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  // sendEvent('bomb_planted', {
  //   ...upperCaseParams,
  //   matchid: event.matchid,
  //   event: event.event,
  // });
}

export function handleBombDefusedEvent(event: BombDefusedEvent) { // TODO -> refactor acording to new get5 update
  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  // sendEvent('bomb_defused', {
  //   ...upperCaseParams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}

export function handleBombExplodedEvent(event: BombExplodedEvent) { // TODO -> refactor acording to new get5 update
  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);

  // sendEvent('bomb_exploded', {
  //   ...upperCaseParams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}

export function handleRoundEndEvent(event: RoundEndEvent) { // TODO -> refactor acording to new get5 update
  // const teams = Object.keys(event.params.teams)
  //   .reduce((acc, paramKey) => {
  //     const teamId = getTeamId(event.matchid, paramKey);
  //     acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
  //     return acc
  //   }, {});

  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  // delete upperCaseParams.teams;

  // sendEvent('round_end', {
  //   ...upperCaseParams,
  //   teams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}



export function handleMapResultEvent(event: MapResultEvent) { // TODO -> refactor acording to new get5 update
  // const teams = Object.keys(event.params.teams)
  //   .reduce((acc, paramKey) => {
  //     const teamId = getTeamId(event.matchid, paramKey);
  //     acc[teamId] = convertObjectKeysToUpperCase(event.params.teams[paramKey]);
  //     return acc
  //   }, {});

  // const upperCaseParams = convertObjectKeysToUpperCase(event.params);
  // delete upperCaseParams.teams;

  // sendEvent('map_end', {
  //   ...upperCaseParams,
  //   teams,
  //   matchid: event.matchid,
  //   event: event.event,
  // })
}

export async function handleSeriesEndEvent(event: SeriesResultEvent) { // TODO -> refactor acording to new get5 update
  const serverId = getServerId(event.matchid);

  const matchResultPath = `${USER_DIR}csgo@${serverId}/csgo/matchstats_${event.matchid}.json`;
  
  try {
    const matchResult = await getResultFromJsonFile(matchResultPath)
    
    console.log(matchResult)

    finishMatch(serverId, matchResult);
  } catch (error) {
    console.log(error);
  }
 
  //   setSeriesData(event.matchid, matchResult);
  //   setMapsData(event.matchid, matchResult);
  //   removeUnnecessaryData(matchResult);
  
  //   const matchEvent = {
  //     matchid: event.matchid,
  //     result: matchResult,
  //   }
  
  //   sendEvent('series_end', matchEvent)
  
  //   moveJsonMatchFileToBackupLocation(serverId, event.matchid)
  //   finishMatch(serverId, matchResult)
    
  // } catch (error) {
  //   console.log(error);
  // }
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

// TODO -> Lets see if this is still needed
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

// TODO -> Lets see if this is still needed
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

// NOT USED ANYMORE, should probably be though
export function sendMatchError(error: any) { // TODO -> create interface for error, whatever it is
  sendEvent('match-error', { error });
}


export function handleGet5Event(get5Event: Get5Event) {
  switch (get5Event.event) {
    case Get5EventName.SERIES_START:
      handleSeriesStartEvent(get5Event as SeriesInitEvent)
      break;
    case Get5EventName.PLAYER_CONNECTED:
      handlePlayerConnectedEvent(get5Event as PlayerConnectedEvent)
      break;
    case Get5EventName.GOING_LIVE:
      handleGoingLiveEvent(get5Event as GoingLiveEvent);
      break;
    case Get5EventName.PLAYER_DEATH:
      handlePlayerDeathEvent(get5Event as PlayerDeathEvent);
      break;
    case Get5EventName.BOMB_PLANTED:
      handleBombPlantedEvent(get5Event as BombPlantedEvent);
      break;
    case Get5EventName.BOMB_DEFUSED:
      handleBombDefusedEvent(get5Event as BombDefusedEvent);
      break;
    case Get5EventName.BOMB_EXPLODED:
      handleBombExplodedEvent(get5Event as BombExplodedEvent);
      break;
    case Get5EventName.ROUND_END:
      handleRoundEndEvent(get5Event as RoundEndEvent);
      break;
    case Get5EventName.MAP_RESULT:
      handleMapResultEvent(get5Event as MapResultEvent);
      break;
    case Get5EventName.SERIES_END:
      handleSeriesEndEvent(get5Event as SeriesResultEvent);
      break;
    default: 
      console.debug("Event not caught in handleGet5Event: ", get5Event)
  }
}