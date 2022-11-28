
import express from 'express';

import * as eventListener from './eventListener.js';
import { logAddressPort } from './constants.js';
import { Get5Event } from './types/event/index.js';

export function setupCSGOLogging() {
  const logger = express();
  
  logger.use(express.json());

  logger.post('/csgolog', (req, res) => {
    eventListener.handleGet5Event(req.body as Get5Event)
    res.send();
  });

  logger.listen(logAddressPort, () => {
    console.log('Running cs go logger server on ' + logAddressPort);
  });
}


