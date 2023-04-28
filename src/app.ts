import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import sockjs from 'sockjs';
import { isMatchDataValid } from './fileHandler.js';
import * as serverHandler from './csgoServerHandler.js';
import * as auth from './auth.js';
import * as csgoLogger from './csgoLogger.js';
import * as eventListener from './eventListener.js';
import { checkEnv } from './utils.js';
import { MatchData } from './types/config.js';
import * as serverHandlerNew from './csgoServerHandlerNew.js';

dotenv.config();
checkEnv();

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(auth.cors);
app.use(auth.checkAuth);

app.post('/startmatch', async (req, res) => {
  const matchData = req.body as MatchData;

  if (serverHandler.serverUpdating()) {
    res.send(
      JSON.stringify({
        succeeded: false,
        errorcode: 'serverbusy',
        error: 'Server busy',
      })
    );
    return;
  }

  if (isMatchDataValid(matchData)) {
    try {
      await serverHandlerNew.createCSGOMatch(matchData);
      res.send(JSON.stringify({succeeded: true}));
      console.debug(`Server started with match id: ${matchData.matchId}`)
    } catch (error) {
      if ((error as Error).message === 'no_servers_available') {
        res.send(
          JSON.stringify({
            succeeded: false,
            errorcode: 'noservers',
            error: 'No servers available',
          })
        );
      } else {
        console.log(error);
        res.status(500);
        res.send(
          JSON.stringify({
            succeeded: false,
            errorcode: 'startmatchfailed',
            error: 'Error in starting match',
          })
        );
      }
    }
  } else {
    res.status(400);
    res.send(
      JSON.stringify({
        succeeded: false,
        errorcode: 'invalidmatchdata',
        error: 'Invalid match data',
      })
    );
  }
});

app.post('/stopmatch', (req, res) => {
  const matchId = req.body.matchid;
  if (serverHandler.serverUpdating()) {
    res.send(
      JSON.stringify({
        succeeded: false,
        error: 'Server busy',
        errorcode: 'serverbusy',
      })
    );
    return;
  }

  if (matchId) {
    serverHandler.stopMatch(matchId);
  } else {
    res.status(400);
    res.send(
      JSON.stringify({
        succeeded: false,
        errorcode: 'invalidmatchid',
        error: 'Invalid match id',
      })
    );
  }
});

app.get('/eventsrequest', (req, res) => {
  res.send(JSON.stringify({ succeeded: true, token: auth.generateJWT() }));
});

const socket = sockjs.createServer({
  sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js',
});

socket.on('connection', function (conn) {
  let authorised = false;
  conn.on('data', function (message) {
    if (!authorised) {
      if (auth.validateJWT(message.toString())) {
        authorised = true;
        eventListener.addSocket(conn);
        conn.on('close', function () {
          eventListener.clearSocket(conn);
        });
      } else {
        conn.close();
        eventListener.clearSocket(conn);
      }
    }
  });
  setTimeout(() => {
    if (!authorised) {
      conn.close();
      eventListener.clearSocket(conn);
    }
  }, 5 * 60 * 1000); // when jwt should expire
});

const server = app.listen(40610, async () => {
  console.log('Running cs go wrapper server on port 40610');
});
socket.installHandlers(server, { prefix: '/events' });

csgoLogger.setupCSGOLogging();
