var currentMatches = {};

export function newMatch(matchId) {
  currentMatches[matchId] = {id: matchId, finished: false, result: {}};
  return matchId;
}

export function cancelMatch(matchId) {
  if (currentMatches[matchId]) {
    delete currentMatches[matchId]
  }
}

export function getMatchResult(matchId) {
  const match = currentMatches[matchId];
  if (match === null || match === undefined) {
    return null;
  } else if (!match.finished) {
    return {};
  } else {
    return match.result;
  }
}

