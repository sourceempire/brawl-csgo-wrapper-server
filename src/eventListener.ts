import { finishMatch } from './csgoServerHandler.js';
import { Connection } from 'sockjs';
import { MatchId } from './types/common.js';
import { getServerAddress, sendAlertMessage } from './csgoServerHandlerNew.js';
import { Get5_Event, Get5_OnGoingLive, Get5_OnMapResult, Get5_OnPlayerConnected, Get5_OnRoundEnd, Get5_OnRoundStart, Get5_OnSeriesInit, Get5_OnSeriesResult } from './types/event/get5Events.js';
import { isMatchReadyToStart, removeTracker } from './handlers/connectedPlayerCountHandler.js';

const socketConnections: Connection[] = [];
const unsentEvents: any[] = [];
const warmupTimers: Record<MatchId, NodeJS.Timer> = {}

function sendEvent(event: any, data: any) {
  const toSend = { ...data, event: event };
  if (socketConnections.length !== 0) {
    for (const socket of socketConnections) {
      socket.write(JSON.stringify(toSend));
    }
  } else {
    unsentEvents.push(toSend);
  }
}

export function addSocket(connection: Connection) {
  socketConnections.push(connection);
  for (const event of unsentEvents) {
    sendEvent(event.event, event);
  }
}

export function clearSocket(connection: Connection) {
  for (let i = socketConnections.length - 1; i >= 0; i--) {
    if (socketConnections[i] === connection) {
      socketConnections.splice(i, 1);
    }
  }
}

function startWarmupTimer(serverId: string, millisecondsToStart: number) {
  let currentMillisecondsToStart = millisecondsToStart;

  warmupTimers[serverId] = setInterval(() => {
    currentMillisecondsToStart -= 1000;

    const minutesLeft = Math.floor(currentMillisecondsToStart / 60000)
    const secondsLeftInMinute = (currentMillisecondsToStart - minutesLeft * 60000) / 1000;
    const timeLeftString = `0${minutesLeft}`.slice(-2) + ':' + `0${secondsLeftInMinute}`.slice(-2)

    sendAlertMessage(serverId, `Starts in ${timeLeftString}, or when everyone is ready`)

    if (currentMillisecondsToStart <= 0) {
      clearWarmupTimer(serverId)
    }
  }, 1000)
}

function clearWarmupTimer(matchId: string) {
  if (warmupTimers[matchId]) {
    clearTimeout(warmupTimers[matchId])
    delete warmupTimers[matchId];
    const a = 'asd'
  }
}


function handleSeriesStart(event: Get5_OnSeriesInit) {
  const { serverId, matchId } = parseServerAndMatchId(event.matchid)

  sendEvent(event.event, {
    matchId,
    event: event.event,
    serverAddress: getServerAddress(serverId),
  });
}


function handlePlayerConnected(event: Get5_OnPlayerConnected) {
  if (isMatchReadyToStart(event.matchid, event)) {
    startWarmupTimer(event.matchid, 300000)
    removeTracker(event.matchid)
  }
}

function handleGoingLiveEvent(event: Get5_OnGoingLive) {
  const { serverId } = parseServerAndMatchId(event.matchid);

  clearWarmupTimer(serverId)
  sendAlertMessage(serverId, 'Match is starting soon')
}

// async function handleStatsUpdatedEvent(event: RoundStatsUpdatedEvent) {
//   // const { matchId } = parseServerAndMatchId(event.matchid)
//   // const matchStats = await serverHandler.getMatchStats({matchId, dumpFile: true})
//   // sendEvent(Get5EventName.STATS_UPDATED, matchStats)
// }


function handleRoundStart(event: Get5_OnRoundStart) {
  console.log('')
}

function handleRoundEndEvent(event: Get5_OnRoundEnd) {
  // const { matchId } = parseServerAndMatchId(event.matchid)

  // sendEvent(event.event, statConversion.roundEndEvent(event));
}

function handleMapResult(event: Get5_OnMapResult) {
  console.log('')
}

async function handleSeriesEndEvent(event: Get5_OnSeriesResult) {
  // const { serverId } = parseServerAndMatchId(event.matchid)

  // const matchStats = await serverHandler.getMatchStats({ matchId: event.matchid });
  // finishMatch(serverId);
  // sendEvent(event.event, matchStats)
}

export function handleGet5Event(get5Event: Get5_Event) {
  switch (get5Event.event) {
    case 'series_start':
      handleSeriesStart(get5Event);
      break;
    case 'player_connect':
      handlePlayerConnected(get5Event);
      break;
    case 'going_live':
      handleGoingLiveEvent(get5Event);
      break;
    case 'round_start':
      handleRoundStart(get5Event);
      break;
    case 'round_end':
      handleRoundEndEvent(get5Event);
      break;
    case 'map_result':
      handleMapResult(get5Event);
      break;
    case 'series_end':
      handleSeriesEndEvent(get5Event);
      break;
    default:
      if (process.env.DEBUG) {
        console.debug(`"Event not caught in handleGet5Event:`)
        console.debug(JSON.stringify(get5Event, null, 2))
      }
  }
}


function parseServerAndMatchId(eventMatchId: string): { serverId: string, matchId: string } {
  const [serverId, matchId] = eventMatchId.split('_')
  return { serverId, matchId }
}
