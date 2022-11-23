import * as createMatchConfig from './matchConfig'
import fs from 'fs';
import jsonschema, { Schema } from 'jsonschema';

export const USER_DIR = '/home/steam/';




//Validates so JSON text from Brawl server is right.
//TESTED: Validation is tested in file CSGOTest on brawl server.
export function validateRightFormatJSON(matchData: any) { // TODO -> fix interface for matchData
    var v = new jsonschema.Validator();

    
    var matchCfgSchema: Schema = {
        'required': ['matchid', 'team1', 'team2', 'map', 'mode'],
        'type': 'object',
        'properties': {
          'matchid': {
              'type': 'string',
          },
          'team1': {
            'type': 'object',
            'properties': {
              'teamId': {
                'type': 'string',
                'format': 'uuid'
              },
              'teamName': {
                'type': 'string'
              },
              'players': { 'oneOf' : [
                {
                  'type': 'array',
                  'minItems': 1,
                  'maxItems': 1,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                  }
                },
                {
                  'type': 'array',
                  'minItems': 2,
                  'maxItems': 2,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                  }
                },
                {
                  'type': 'array',
                  'minItems': 5,
                  'maxItems': 5,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                    }
                  }
                ]
              }
            }
          },
          'team2': {
            'type': 'object',
            'properties': {
              'teamId': {
                'type': 'string',
                'format': 'uuid'
              },
              'teamName': {
                'type': 'string'
              },
              'players': {'oneOf' : [
                {
                  'type': 'array',
                  'minItems': 1,
                  'maxItems': 1,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                  }
                },
                {
                  'type': 'array',
                  'minItems': 2,
                  'maxItems': 2,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                  }
                },
                {
                  'type': 'array',
                  'minItems': 5,
                  'maxItems': 5,
                  'uniqueItems': true,
                  'items': {
                    'type':'string',
                    'minLength':5,
                    'maxLength': 30,
                  }
                }
              ]
            }
          }
        },
        'map': {
            'type': 'string',
        },
        'mode': {
            'type': 'string',
        },
        
      }
    };

    try {
      return v.validate(matchData, matchCfgSchema).valid;
    } catch(e) {
      console.log(e);
      return false;
    }
}
//Create the match.cfg file with the right matchid and right players on right team and convert it to valve format
export function createMatchCfg(matchData: any, serverId: string, matchId: string) { // TODO -> fix interface for matchData
  const { teamName: team1Name, players: team1Players } = matchData.team1
  const { teamName: team2Name, players: team2Players } = matchData.team2
  
  // convert arrays to maps
  var team1 = teamListToObj(team1Players);
  var team2 = teamListToObj(team2Players);

  var obj;
  if (matchData.mode === 'competitive') {
      obj = createMatchConfig.createCompetetiveConfig(matchId, team1, team2, team1Name, team2Name, matchData.map);
  }
  else if(matchData.mode === 'wingman') {
      obj = createMatchConfig.createWingmanConfig(matchId, team1, team2, team1Name, team2Name, matchData.map);
  }
  else if(matchData.mode === 'deathmatch') {
      obj = createMatchConfig.createDeathmatchConfig(matchId, team1, team2, team1Name, team2Name, matchData.map);
  }
  else if(matchData.mode === 'one_vs_one') {
      obj = createMatchConfig.create1vs1Config(matchId, team1, team2, team1Name, team2Name, matchData.map);
  }
  else {
      throw 'Invalid game mode';
  }

  const matchDir = `${USER_DIR}csgo@${serverId}/csgo`


  fs.writeFile(`${matchDir}/match.json`, JSON.stringify(obj), (error) => {
    if (error) {
      console.log('Error creating match.cfg', error);
    }
  })
  
}

export function getResultFromJsonFile(filePath: string) {
  return new Promise((resolve, reject) => {
    if (!filePath.endsWith('.json')) {
      reject('file must be of type json');
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      } 
      
      resolve(JSON.parse(data.toString())); // NOT TESTED, added toString()
    });
  })
}

export function moveJsonMatchFileToBackupLocation(serverId: string, matchId: string) {
  const fileName = `get5_matchstats_${matchId}.json`;
  const filePath = `${USER_DIR}csgo@${serverId}/csgo/${fileName}`;
  
  createJsonBackupLocationIfNonExistent();
  const backupLocation = `${USER_DIR}backup_matchfiles/${fileName}`;

  // Moves file
  fs.rename(filePath, backupLocation, function (error) {
    if (error) console.log(error);
    // TODO -> check if below function works when working with json instead of cfg
    // deleteUnecessaryMatchFiles(serverId);
  })
}

function createJsonBackupLocationIfNonExistent() {
  const _dirPath = USER_DIR+'backup_matchfiles';
  if (!fs.existsSync(_dirPath)) {
    // Folder absent
    // Create folder
    fs.mkdir(_dirPath, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
}


// if a non-empty string is provided as value, it will change the nick for that player (not tested)
/**
* Convert team list of format ['id1', 'id2'] to {'id1': '', 'id2': ''}
*/
function teamListToObj(list: string[]) {
    return list.reduce(
        (acc, id) => Object.assign(acc, {[id]: '' }),
        {});
}
