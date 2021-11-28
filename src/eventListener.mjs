

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
  _sendEvent("match-result", {match_id: matchId, result: result});
}

export function sendMatchError(error) {
  _sendEvent("match-error", {error: error});
}