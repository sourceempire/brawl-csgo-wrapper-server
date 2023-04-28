
import express from 'express';

import * as eventListener from './eventListener.js';
import { logAddressPort } from './constants.js';
import { Get5_Event } from './types/event/get5Events.js';

export function setupCSGOLogging() {
  const logger = express();
  
  logger.use(express.json());

  logger.post('/csgolog', (req, res) => {
    console.log('Get5Event ->', req.body)
    eventListener.handleGet5Event(req.body as Get5_Event)
    res.send();
  });

  logger.listen(logAddressPort, () => {
    console.log('Running cs go logger server on ' + logAddressPort);
  });
}


