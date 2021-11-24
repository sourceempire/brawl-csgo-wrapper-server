
var express = require('express');

var serverHandler = require('./csgoServerHandler');
const { logAddressPort } = require('./constants');


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


function setupCSGOLogging() {
    var logger = express();
    logger.use(rawBody);
    logger.post('/csgolog', (req, res) => {
        var events = req.rawBody.split('\n');
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.includes('get5_event:')) {
                try {
                    var get5Event = JSON.parse(event.split('get5_event:')[1]);
                    handleGet5Events(get5Event);
                } catch(err) {
                    console.dir(err)
                }
            }    
        }
        res.send();
    });

    logger.listen(logAddressPort, () => {
        console.log('Running cs go logger server on ' + logAddressPort);
    });
}

function handleGet5Events(get5Event) {
    switch (get5Event.event) {
        case 'series_start':
            console.log(get5Event)
            break;
        case 'side_picked':
            console.log(get5Event)
            break;
        case 'going_live':
            serverHandler.setMatchStarted(get5Event['matchid`']);  
            break;
        case 'player_death':
            console.log(get5Event)
            break;
        case 'bomb_planted':
            console.log(get5Event)
            break;
        case 'bomb_defused':
            console.log(get5Event)
            break;
        case 'bomb_exploded':
            console.log(get5Event)
            break;
        case 'round_end':
            console.log(get5Event)
            break;
        case 'side_swap':
            console.log(get5Event)
            break;
        case 'map_end':
            console.log(get5Event)
            break;
        case 'series_end':
            console.log(get5Event)
            break;
        default:
            return;
    }
}

module.exports = {
    setupCSGOLogging
}
