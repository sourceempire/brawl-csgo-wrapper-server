import vdf from 'simple-vdf';
import { isEmpty } from './utils.mjs';

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

export function setMatchResult(matchId, result) {
  const match = currentMatches[matchId];
  if (match === null || match === undefined) {
    return null;
  } else {
    match.finished = true;
    match.result = result;
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

export function setDummyResult(matchId) {
  const vdfString = `
    "Stats"
    {
      "series_type"   "bo1"
      "team1_name"    "Team Marting"
      "team2_name"    "Team Jotto"
      "map0"
      {
        "team2"
        {
          "76561198113577192"
          {
            "roundsplayed"    "12"
            "name"    "Göteborgarrn"
            "damage"    "724"
            "firstkill_t"   "6"
            "kills"   "6"
            "1kill_rounds"    "5"
            "v1"    "2"
            "deaths"    "4"
            "firstdeath_t"    "3"
            "bomb_plants"   "1"
            "headshot_kills"    "2"
            "assists"   "2"
          }
          "76561197975938293"
          {
            "roundsplayed"    "12"
            "name"    "Ottomaskinen ︻╦╤─"
            "damage"    "238"
            "firstkill_t"   "2"
            "kills"   "2"
            "headshot_kills"    "1"
            "1kill_rounds"    "2"
            "deaths"    "5"
            "firstdeath_t"    "3"
            "assists"   "1"
            "v1"    "2"
            "bomb_plants"   "1"
            "firstdeath_ct"   "1"
          }
          "score"   "16"
        }
        "team1"
        {
          "76561197987052833"
          {
            "roundsplayed"    "12"
            "name"    "martin."
            "deaths"    "16"
            "firstdeath_ct"   "13"
            "damage"    "887"
            "firstkill_ct"    "11"
            "kills"   "9"
            "headshot_kills"    "3"
            "1kill_rounds"    "5"
            "2kill_rounds"    "2"
            "v1"    "3"
            "bomb_defuses"    "1"
            "suicides"    "8"
            "firstdeath_t"    "3"
            "firstkill_t"   "4"
          }
          "score"   "3"
        }
        "mapname"   "de_dust2"
        "winner"    "team2"
      }
      "winner"    "team2"
    }
  `;
  setMatchResult(matchId, vdf.parse(vdfString));
}

export function getMatchResultFormated(matchId) {
  var result = getMatchResult(matchId);
  if (result === null || isEmpty(result)) {
    return result;
  } else {
    result = result.Stats;
    var teamsScore = _countTotalRoundsWon(result);
    return {
      winner_of_all: result.winner,
      teams: {
        team1: {
          name: result.team1_name,
          roundsWon: teamsScore.team1Score
        },
        team2: {
          name: result.team2_name,
          roundsWon: teamsScore.team2Score
        }
      },
      maps: _getMapsResult(result)
    };
  }
}


function _getMapsResult(result) {
  var i = 0;
  var results = [];
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (result['map'+i] === undefined) {
      break;
    }

    var mapResult = result['map'+i];
    results.push({
        map: mapResult.mapname,
        winner: mapResult.winner,
        team1: {
          score: parseInt(mapResult.team1.score) || 0,
          players: _getTeamResult(mapResult.team1)
        },
        team2: {
          score: parseInt(mapResult.team2.score) || 0,
          players: _getTeamResult(mapResult.team2)
        }
      });

    i++;
  }
  return results;
}


function _getTeamResult(teamResult) {
  var players = [];
  for (var steamId in teamResult) {
    // eslint-disable-next-line no-prototype-builtins
    if (teamResult.hasOwnProperty(steamId)) {
      var playerResult = teamResult[steamId];
      if (steamId === 'score') {
        continue;
      } else if (playerResult.name === 'undefined') {
        continue; // attribute not a player
      } else {
        players.push({
          steam_id: steamId,
          kills: parseInt(playerResult.kills) || 0,
          deaths: parseInt(playerResult.deaths) || 0,
          assists: parseInt(playerResult.assists) || 0,
          score: parseInt(playerResult.score) || 0,
        });
      }
    }
  }
  return players;
}

function _countTotalRoundsWon(result) {
  var i = 0;
  var team1Score = 0;
  var team2Score = 0;
  
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (result['map'+i] === undefined) {
      break;
    }
    var mapResult = result['map'+i];
    team1Score += parseInt(mapResult.team1.score);
    team2Score += parseInt(mapResult.team2.score);

    i++;
  }
  return {team1Score, team2Score};
}

