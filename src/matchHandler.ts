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


