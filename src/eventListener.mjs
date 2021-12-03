

const sockets = [];
const unsentEvents = [];

function _sendEvent(event, data) {
  let toSend = {...data, event: event};
  if (sockets.length !== 0) {
    for (let socket of sockets) {
      socket.write(JSON.stringify(toSend));
    }
    
  } else {
    unsentEvents.push(toSend);
  }
}

export function addSocket(s) {
  sockets.push(s);
  for (let event in unsentEvents) {
    _sendEvent(event.event, event);
  }
}

export function clearSocket(conn) {
  for (var i = sockets.length-1; i >= 0; i--) {
    if (sockets[i] === conn) {
       sockets.splice(i, 1);
    }
  }  
}

export function sendMatchResult(matchId, result) {
  _sendEvent('match-result', {match_id: matchId, result: result});
}

export function sendSeriesStartEvent(event) {
  _sendEvent('series_start', event)
}

export function sendGoingLiveEvent(event) {
  _sendEvent('going_live', event)
}

export function sendPlayerEvent(event) {
  _sendEvent('player_death', event)
}

export function sendBombPlantedEvent(event) {
  _sendEvent('bomb_planted', event)
}

export function bombDefusedEvent(event) {
  _sendEvent('bomb_defused', event)
}

export function bombExplodedEvent(event) {
  _sendEvent('bomb_exploded', event)
}

export function roundEndEvent(event) {
  _sendEvent('round_end', event)
}

export function sideSwapEvent(event) {
  _sendEvent('side_swap', event)
}

export function mapEndEvent(event) {
  _sendEvent('map_end', event)
}

export function seriesEndEvent(event) {
  _sendEvent('series_end', event)
}

export function sendMatchError(error) {
  _sendEvent('match-error', {error: error});
}