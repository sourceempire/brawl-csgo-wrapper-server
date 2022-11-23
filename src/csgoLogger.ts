
import express, { NextFunction, Request, Response } from 'express';

import * as serverHandler from './csgoServerHandler';
import * as eventListener from './eventListener';
import { logAddressPort } from './constants';

export function setupCSGOLogging() {
  var logger = express();
  logger.use(rawBody);
  
  logger.post('/csgolog', (req, res) => {

    console.log(JSON.stringify(JSON.parse(req.body), null, 2))

  
    // const get5Events = extractGet5EventsFromCsgoEventString(rawBodyRequest.rawBody)
    // get5Events.forEach(handleGet5Events)
    res.send();
  });

  logger.listen(logAddressPort, () => {
    console.log('Running cs go logger server on ' + logAddressPort);
  });
}

// TODO -> update any to event interface, Get5 has the schema on the website
function handleGet5Events(get5Event: Record<string, any>) {
  switch (get5Event.event) {
    case 'series_start':
      console.log(JSON.stringify(get5Event, null, 2))
      eventListener.sendSeriesStartEvent(get5Event)
      break;
    case 'going_live':
      console.log(JSON.stringify(get5Event, null, 2))
      serverHandler.setMatchStarted(get5Event['matchid']);
      eventListener.sendGoingLiveEvent(get5Event);
      break;
    case 'player_death':
      eventListener.sendPlayerDeathEvent(get5Event);
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
      console.log(JSON.stringify(get5Event, null, 2))
      eventListener.roundEndEvent(get5Event);
      break;
    case 'side_swap':
      console.log(JSON.stringify(get5Event, null, 2))
      eventListener.sideSwapEvent(get5Event);
      break;
    case 'map_end':
      console.log(JSON.stringify(get5Event, null, 2))
      eventListener.mapEndEvent(get5Event);
      break;
    case 'series_end':
      console.log(JSON.stringify(get5Event, null, 2))
      eventListener.seriesEndEvent(get5Event);
      break;
    default:
      return;
  }
}

function rawBody(req: Request, res: Response, next: NextFunction) {
  req.setEncoding('utf8');
  req.body = '';
  req.on('data', function(chunk) {
    console.log(chunk) // TODO ->  Might be able to parse json here due to how get5 sends data nowdays
    req.body += chunk;
  });
  req.on('end', function(){
    next();
  });
}

