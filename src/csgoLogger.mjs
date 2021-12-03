
import express from 'express';

import * as serverHandler from './csgoServerHandler.mjs';
import * as eventListener from './eventListener.mjs';
import { logAddressPort } from './constants.mjs';

export function setupCSGOLogging() {
  var logger = express();
  logger.use(rawBody);
  
  logger.post('/csgolog', (req, res) => {
    const get5Events = extractGet5EventsFromCsgoEventString(req.rawBody)
    get5Events.forEach(handleGet5Events)
    res.send();
  });

  logger.listen(logAddressPort, () => {
    console.log('Running cs go logger server on ' + logAddressPort);
  });
}

function extractGet5EventsFromCsgoEventString(csgoEventString) {
  const get5EventPrefix = 'get5_event:'
  if (csgoEventString.includes(get5EventPrefix)) {
    return csgoEventString.split(get5EventPrefix)
      .filter((_, index) => index !== 0)
      .filter(x => x !== '')
      .map(parseGet5Event)
      .filter(x => x !== null)
  } else {
    return [];
  }
}

function parseGet5Event(get5String) {
  let jsonNestedLevel = 0;
  const get5TrimmedString = get5String.trim()
  let i;

  for (i = 0; i < get5TrimmedString.length; i++) {
    if (get5TrimmedString[i] === '{') jsonNestedLevel++; 
    else if (get5TrimmedString[i] === '}') jsonNestedLevel--;
    if (jsonNestedLevel === 0) break;
  }
  try {
    return JSON.parse(get5TrimmedString.substring(0, i+1))
  } catch (error) {
    console.log(get5String, error);
    return null;
  }
}

function handleGet5Events(get5Event) {
  switch (get5Event.event) {
    case 'series_start':
      eventListener.sendSeriesStartEvent(get5Event)
      // console.log(get5Event)
      break;
    case 'going_live': 
      serverHandler.setMatchStarted(get5Event['matchid']);
      eventListener.sendGoingLiveEvent(get5Event);
      break;
    case 'player_death':
      eventListener.sendPlayerEvent(get5Event);
      break;
    case 'bomb_planted':
      eventListener.sendBombPlantedEvent(get5Event);
      break;
    case 'bomb_defused':
      eventListener.bombDefusedEvent(get5Event);
      break;
    case 'bomb_exploded':
      eventListener.bombExplodedEvent(get5Event);
      break;
    case 'round_end':
      eventListener.roundEndEvent(get5Event);
      break;
    case 'side_swap':
      eventListener.sideSwapEvent(get5Event);
      break;
    case 'map_end':
      eventListener.mapEndEvent(get5Event);
      break;
    case 'series_end':
      eventListener.seriesEndEvent(get5Event);
      break;
    default:
      return;
  }
}

function rawBody(req, res, next) {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', function(chunk) {
    req.rawBody += chunk;
  });
  req.on('end', function(){
    next();
  });
}

