import * as createMatchConfig from './matchConfig.js'
import fs from 'fs';
import jsonschema, { Schema } from 'jsonschema';
import { Get5MatchTeam, MatchData } from './types/config.js';
import { SeriesStatsRaw } from './types/matchStats.js';
import { getServersPath } from './utils.js';

export function validateMatchData(matchData: MatchData) {
  var v = new jsonschema.Validator();

  var matchCfgSchema: Schema = {
    required: ["matchId", "team1", "team2", "map", "mode"],
    type: "object",
    definitions: {
      team: {
        type: "object",
        properties: {
          teamId: {
            type: "string",
            format: "uuid"
          },
          name: {
            type: "string"
          },
          players: {
            type: "array",
            minItems: 1,
            maxItems: 5,
            uniqueItems: true,
            items: {
              type: "object",
              patternProperties: {
                "^[0-9]{17}$": {
                  type: "string",
                  minLength: 1,
                  maxLength: 250
                }
              },
              additionalProperties: false
            }
          }
        }
      }
    },
    properties: {
      matchId: {
        type: "string"
      },
      team1: {
        $ref: "#/definitions/team"
      },
      team2: {
        $ref: "#/definitions/team"
      },
      map: {
        type: "string"
      },
      mode: {
        type: "string",
        enum: ["wingman", "competitive"]
      }
    }
  };

  try {
    return v.validate(matchData, matchCfgSchema).valid;
  } catch (e) {
    console.log(e);
    return false;
  }
}



//Create the match.cfg file with the right matchId and right players on right team and convert it to valve format
export function createMatchCfg(matchData: any, serverId: string) { // TODO -> fix interface for matchData
  const matchId = matchData.matchId;

  const { teamName: team1Name, players: team1Players } = matchData.team1
  const { teamName: team2Name, players: team2Players } = matchData.team2

  const team1: Get5MatchTeam = {
    name: team1Name,
    players: teamListToObj(team1Players)
  }

  const team2: Get5MatchTeam = {
    name: team2Name,
    players: teamListToObj(team2Players)
  }

  var obj;
  if (matchData.mode === 'competitive') {
    obj = createMatchConfig.createCompetetiveConfig(matchId, team1, team2, matchData.map);
  }
  else if (matchData.mode === 'wingman') {
    obj = createMatchConfig.createWingmanConfig(matchId, team1, team2, matchData.map);
  }
  else {
    throw 'Invalid game mode';
  }

  const matchDir = `${getServersPath()}/csgo@${serverId}/csgo`


  fs.writeFile(`${matchDir}/match.json`, JSON.stringify(obj), (error) => {
    if (error) {
      console.log('Error creating match.cfg', error);
    }
  })
}

export function getResultFromJsonFile(filePath: string): Promise<SeriesStatsRaw> {
  return new Promise((resolve, reject) => {
    if (!filePath.endsWith('.json')) {
      reject('file must be of type json');
    }
    fs.readFile(filePath, (err, buffer) => {
      if (err) {
        reject(err);
        return;
      }

      try {
        resolve(JSON.parse(buffer.toString()));
      } catch (error) {
        console.error(error)
      }
    });
  })
}


// if a non-empty string is provided as value, it will change the nick for that player (not tested)
/**
* Convert team list of format ['id1', 'id2'] to {'id1': '', 'id2': ''}
*/
function teamListToObj(list: string[]) {
  return list.reduce(
    (acc, id) => Object.assign(acc, { [id]: '' }),
    {});
}

