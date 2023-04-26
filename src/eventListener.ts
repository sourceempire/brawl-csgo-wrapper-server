import { finishMatch } from './csgoServerHandler.js';
import { getServerId } from './csgoServerHandler.js';
import * as serverHandler from './csgoServerHandler.js';
import {Connection} from "sockjs";
import { MatchId, SteamId } from './types/common.js';
import {
  Get5Event,
  Get5EventName,
  GoingLiveEvent,
  MapResultEvent,
  PlayerConnectedEvent,
  RoundEndEvent,
  RoundStatsUpdatedEvent,
  SeriesInitEvent,
  SeriesResultEvent,
  Team
} from './types/event/index.js';
import { statConversion } from './conversions.js';
import { getServerAddress } from './csgoServerHandlerNew.js';

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

function startWarmupTimer(matchId: string, millisecondsToStart: number) {
  let currentMillisecondsToStart = millisecondsToStart;

  warmupTimers[matchId] = setInterval(() => {
    currentMillisecondsToStart -= 1000;

    const minutesLeft = Math.floor(currentMillisecondsToStart / 60000)
    const secondsLeftInMinute = (currentMillisecondsToStart - minutesLeft * 60000) / 1000;
    const timeLeftString = `0${minutesLeft}`.slice(-2) +':'+ `0${secondsLeftInMinute}`.slice(-2)

    serverHandler.sendAlertMessage(matchId, `Starts in ${timeLeftString}, or when everyone is ready`)
    
    if (currentMillisecondsToStart <= 0) {
      clearWarmupTimer(matchId)
    }
  }, 1000)
}

function clearWarmupTimer(matchId: string) {
  if (warmupTimers[matchId]) {
    clearTimeout(warmupTimers[matchId])
    delete warmupTimers[matchId];
  }
}

function isTeamConnected(matchId: MatchId, team: Team) {
  const teamPlayers = serverHandler.getPlayers(matchId, team)
  return teamPlayers.every((steamId: SteamId) => connectedPlayers[matchId].includes(steamId))
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

function handleSeriesStartEvent(event: SeriesInitEvent) { // TODO -> refactor acording to new get5 update
  const [serverId, matchId] = event.matchid.split("_")
  console.log({serverId, matchId, address: getServerAddress(serverId)})
  sendEvent(event.event, {
    matchId,
    event: event.event,
    serverAddress: getServerAddress(serverId),
  });
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
    startWarmupTimer(matchId, 300000)
  }
}

function handleGoingLiveEvent(event: GoingLiveEvent) {
  clearWarmupTimer(event.matchid)
  serverHandler.setMatchStarted(event.matchid);
  serverHandler.sendAlertMessage(event.matchid, "Match is starting soon")
}

async function handleStatsUpdatedEvent(event: RoundStatsUpdatedEvent) {
  const matchStats = await serverHandler.getMatchStats({matchId: event.matchid, dumpFile: true})
  sendEvent(Get5EventName.STATS_UPDATED, matchStats)
}

function handleRoundEndEvent(event: RoundEndEvent) {
  sendEvent(event.event, statConversion.roundEndEvent(event));
}

async function handleSeriesEndEvent(event: SeriesResultEvent) {
  const serverId = getServerId(event.matchid);

  const matchStats = await serverHandler.getMatchStats({matchId: event.matchid});
  finishMatch(serverId);
  sendEvent(event.event, matchStats)
}

export function handleGet5Event(get5Event: Get5Event) {
  switch (get5Event.event) {
    case Get5EventName.SERIES_START:
      handleSeriesStartEvent(get5Event as SeriesInitEvent);
      break;
    case Get5EventName.PLAYER_CONNECTED:
      handlePlayerConnectedEvent(get5Event as PlayerConnectedEvent);
      break;
    case Get5EventName.GOING_LIVE:
      handleGoingLiveEvent(get5Event as GoingLiveEvent);
      break;
    case Get5EventName.STATS_UPDATED:
      handleStatsUpdatedEvent(get5Event as RoundStatsUpdatedEvent);
      break;
    case Get5EventName.ROUND_END:
      handleRoundEndEvent(get5Event as RoundEndEvent);
      break;
    case Get5EventName.SERIES_END:
      handleSeriesEndEvent(get5Event as SeriesResultEvent);
      break;
    default: 
      if (process.env.DEBUG) {
        console.debug(`"${get5Event.event}" event not caught in handleGet5Event`)
      }
  }
}

// NOT USED ANYMORE, should probably be though
export function sendMatchError(error: any) { // TODO -> create interface for error, whatever it is
  sendEvent('match-error', { error });
}
