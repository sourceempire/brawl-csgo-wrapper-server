
import express from 'express';

import * as serverHandler from './csgoServerHandler.js';
import * as eventListener from './eventListener.js';
import { logAddressPort } from './constants.js';

export function setupCSGOLogging() {
  var logger = express();
  
  logger.use(express.json());

  logger.post('/csgolog', (req, res) => {
    
    console.log(req.body)
    handleGet5Events(req.body)
    
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
      eventListener.sendSeriesStartEvent(get5Event)
      break;
    case 'going_live':
      serverHandler.setMatchStarted(get5Event['matchid']);
      // eventListener.sendGoingLiveEvent(get5Event);
      break;
    // case 'player_death':
    //   eventListener.sendPlayerDeathEvent(get5Event);
    //   break;
    // case 'bomb_planted':
    //   eventListener.sendBombPlantedEvent(get5Event);
    //   break;
    // case 'bomb_defused':
    //   eventListener.bombDefusedEvent(get5Event);
    //   break;
    // case 'bomb_exploded':
    //   eventListener.bombExplodedEvent(get5Event);
    //   break;
    // case 'round_end':
    //   eventListener.roundEndEvent(get5Event);
    //   break;
    // case 'side_swap':
    //   eventListener.sideSwapEvent(get5Event);
    //   break;
    // case 'map_result':
    //   eventListener.mapEndEvent(get5Event);
    //   break;
    // case 'series_end':
    //   eventListener.seriesEndEvent(get5Event);
    //   break;
    default:
      return;
  }
}
