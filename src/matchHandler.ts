interface Match {
  id: string, 
  finished: boolean, 
  result: Record<string, any> // TODO -> update any to result interface
}

var currentMatches: {[matchId: string]: Match} = {};

export function newMatch(matchId: string) {
  currentMatches[matchId] = {id: matchId, finished: false, result: {}};
  return matchId;
}

export function cancelMatch(matchId: string) {
  if (currentMatches[matchId]) {
    delete currentMatches[matchId]
  }
}

export function getMatchResult(matchId: string) {
  const match = currentMatches[matchId];
  if (match === null || match === undefined) {
    return null;
  } else if (!match.finished) {
    return {};
  } else {
    return match.result;
  }
}

