import { getServerAddress, getTeamId } from './csgoServerHandler.js';
import { finishMatch } from './csgoServerHandler.js';
import { getServerId } from './csgoServerHandler.js';
import { moveJsonMatchFileToBackupLocation } from './fileHandler.js';
import { getResultFromJsonFile } from './fileHandler.js';
import { USER_DIR } from './fileHandler.js';
import * as serverHandler from './csgoServerHandler.js';

import {Connection} from "sockjs";

import { MatchId, SteamId } from './types/common.js';
import {
  BombDefusedEvent,
  BombExplodedEvent,
  BombPlantedEvent,
  Get5Event,
  Get5EventName,
  GoingLiveEvent,
  MapResultEvent,
  PlayerConnectedEvent,
  PlayerDeathEvent,
  RoundEndEvent,
  SeriesInitEvent,
  SeriesResultEvent,
  Team
} from './types/event/index.js';
import { 
  isBestOf1,
  isBestOf3,
  isBestOf5,
  MapResult,
  MapResultRaw,
  PlayerStats,
  PlayerStatsRaw,
  SeriesResult,
  SeriesResultRaw,
  TeamInfo,
  TeamInfoRaw 
} from './types/matchResult.js';

const sockets: Connection[] = [];
const unsentEvents: any[] = []; // TODO -> create type for unsentEvents
const connectedPlayers: Record<MatchId, SteamId[]> = {}
const warmupTimers: Record<MatchId, NodeJS.Timer> = {}

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
  sendEvent(event.event, {
    matchid: event.matchid,
    event: event.event,
    serverAddress: getServerAddress(event.matchid),
  });
}

function clearWarmupTimer(matchId) {
  if (warmupTimers[matchId]) {
    clearTimeout(warmupTimers[matchId])
    delete warmupTimers[matchId];
  }
}

function handlePlayerConnectedEvent(event: PlayerConnectedEvent) {
  const matchId = event.matchid

  if (!connectedPlayers[matchId]) {
    connectedPlayers[matchId] = []
  }

  connectedPlayers[matchId].push(event.player.steamid)

  const isTeam1Connected = isTeamConnected(matchId, Team.TEAM1)
  const isTeam2Connected = isTeamConnected(matchId, Team.TEAM2)

  if (isTeam1Connected && isTeam2Connected) {
    delete connectedPlayers[matchId];
    const miliSecondsToStart = 300000 // 5 minutes
    let currentMiliSecondsToStart = miliSecondsToStart;
    
    warmupTimers[matchId] = setInterval(() => {
      currentMiliSecondsToStart -= 1000;
      const minutesLeft = Math.floor(currentMiliSecondsToStart / 60000)
      const secondsLeftInMinute = (currentMiliSecondsToStart - minutesLeft * 60000) / 1000;
      const timeLeftString = `0${minutesLeft}`.slice(-2) +':'+ `0${secondsLeftInMinute}`.slice(-2)
      serverHandler.sendAlertMessage(matchId, `Starts in ${timeLeftString}, or when everyone is ready`)
      if (currentMiliSecondsToStart <= 0) {
        clearWarmupTimer(matchId)
      }
    }, 1000)
  }
}

export function handleGoingLiveEvent(event: GoingLiveEvent) { // TODO -> refactor acording to new get5 update
  clearWarmupTimer(event.matchid)
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

function isTeamConnected(matchId: MatchId, team: Team) {
  const teamPlayers = serverHandler.getPlayers(matchId, team)
  return teamPlayers.every((steamId) => connectedPlayers[matchId].includes(steamId))
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
    const seriesResultRaw = await getResultFromJsonFile(matchResultPath)
    const seriesResult = convertSeriesResult(event.matchid, seriesResultRaw)
    finishMatch(serverId);
    sendEvent(event.event, seriesResult)
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

const convertSeriesResult = (matchId: MatchId, seriesResultRaw: SeriesResultRaw): SeriesResult => {
  let maps: MapResultRaw[] = []

  if (isBestOf1(seriesResultRaw)) {
    const {map0} = seriesResultRaw
    maps.push(map0)
  } else if (isBestOf3(seriesResultRaw)) {
    const {map0, map1, map2} = seriesResultRaw
    maps.push(map0, map1, map2)
  } else if (isBestOf5(seriesResultRaw)) {
    const {map0, map1, map2, map3, map4} = seriesResultRaw
    maps.push(map0, map1, map2, map3, map4)
  }

  return {
    matchId,
    winner: seriesResultRaw.winner,
    maps: maps.map((mapRaw) => convertMapResult(matchId, mapRaw))
  }
}

const convertMapResult = (matchId: MatchId, mapResultRaw: MapResultRaw): MapResult => {
  const team1Id = getTeamId(matchId, Team.TEAM1)
  const team2Id = getTeamId(matchId, Team.TEAM2)

  const {winner, mapname, team1, team2} = mapResultRaw

  return {
    winner,
    mapName: mapname,
    teams: {
      [team1Id]: convertTeamInfo(team1),
      [team2Id]: convertTeamInfo(team2)
    }
  }
}

const convertTeamInfo = (teamInfoRaw: TeamInfoRaw): TeamInfo => {
  const {score} = teamInfoRaw;

  const steamIds = Object.keys(teamInfoRaw).filter((key) => key !== "score");  

  return {
    score,
    players: steamIds.reduce((acc, steamId) => {
      const playerInfoRaw = teamInfoRaw[steamId];
      acc[steamId] = convertPlayerStats(playerInfoRaw)
      return acc;
    }, {})
  }
}

const convertPlayerStats = (playerStatsRaw: PlayerStatsRaw): PlayerStats => {
  const {
    assists,
    bomb_defuses,
    bomb_plants,
    deaths,
    headshot_kills,
    kills,
    mvp,
    teamkills
  } = playerStatsRaw;
  
  return {
    assists: assists,
    bombDefuses: bomb_defuses,
    bombPlants: bomb_plants,
    deaths: deaths,
    headshotKills: headshot_kills,
    kills: kills,
    mvp: mvp,
    teamKills: teamkills,
  }
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

// NOT USED ANYMORE, should probably be though
export function sendMatchError(error: any) { // TODO -> create interface for error, whatever it is
  sendEvent('match-error', { error });
}
