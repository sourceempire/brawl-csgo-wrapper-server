import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import sockjs from 'sockjs';
import {
  validateRightFormatJSON,
} from './fileHandler.mjs';
import * as serverHandler from './csgoServerHandler.mjs';
import * as matchHandler from './matchHandler.mjs';
import {isEmpty} from './utils.mjs';
import * as auth from './auth.mjs';
import * as csgoLogger from './csgoLogger.mjs';
import * as eventListener from './eventListener.mjs';

dotenv.config()

var app = express();
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(auth.cors);
app.use(auth.checkAuth);

serverHandler.checkIfUpdateNeeded();

app.post('/startmatch',  (req, res) => {
    var matchData = req.body;
    if (serverHandler.serverUpdating()) {
        res.send('{"succeeded": false, "error": "Server busy", "errorcode": "serverbusy"}');
        return;
    }
    
    if (validateRightFormatJSON(matchData)) {
        try {
            const matchId = serverHandler.startNewMatch(matchData);
            if (matchId !== null) {
                var link = serverHandler.getJoinLink(matchId);
                res.send('{"succeeded": true, "joinlink": "'+link+'"}');
            } else {
                res.send('{"succeeded": false, "error": "No servers available", "errorcode": "noservers"}');
            }
        } catch(error) {
            console.log(error)
            res.status(500);
            res.send('{"succeeded": false, "errorcode": "startmatchfailed", "error": "Error in starting match"}');    
        }
    } else {
        res.status(400);
        res.send('{"succeeded": false, "errorcode": "invalidmatchdata", "error": "Invalid match data"}');
    }

});

app.post('/stopmatch', (req, res) => { 
    var matchId = req.body.matchid;
    if (serverHandler.serverUpdating()) {
        res.send('{"succeeded": false, "error": "Server busy", "errorcode": "serverbusy"}');
        return;
    }
    
    if (matchId) {
        serverHandler.stopMatch(matchId);
    } else {
        res.status(400);
        res.send('{"succeeded": false, "errorcode": "invalidmatchid", "error": "Invalid match id"}');
    }
    
});

app.get('/getmatchresult', (req, res) => {
    var matchid = req.query.matchid;
    var result = matchHandler.getMatchResultFormated(matchid);
    if (result === null) {
        res.send('{"succeeded": false, "error": "No such match", "errorcode": "nomatch"}');
    } else if (isEmpty(result)) {
        res.send('{"succeeded": false, "error": "Match not finished", "errorcode": "matchongoing"}');
    } else {
        res.send(JSON.stringify({succeeded: true, matchresult: result}));
    }
});

app.get('/eventsrequest', (req, res) => {
  res.send(JSON.stringify({succeeded: true, token: auth.generateJWT()}));
});

const socket = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
socket.on('connection', function(conn) {
  let authorised = false;
  conn.on('data', function(message) {
    if (!authorised) {
      if (auth.validateJWT(message.toString())) {
        authorised = true;
        eventListener.addSocket(conn);
        conn.on('close', function() {
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
  }, 5*60*1000); // when jwt should expire
});

const server = app.listen(40610, () => {
    console.log('Running cs go wrapper server on 40610');
});
socket.installHandlers(server, { prefix: '/events' });

csgoLogger.setupCSGOLogging();