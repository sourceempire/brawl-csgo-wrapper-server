import * as createMatchConfig from './matchConfig.mjs'
import fs from 'fs';
import vdf from 'simple-vdf';
import jsonschema from 'jsonschema';
import glob from 'glob';

export const USER_DIR = '/home/steam/';


//Validates so JSON text from Brawl server is right.
//TESTED: Validation is tested in file CSGOTest on brawl server.
export function validateRightFormatJSON(matchData){
    var v = new jsonschema.Validator();

    var matchCfgSchema = {
        'type': 'object',
        'properties': {
          'matchid': {
              'type': 'string',
          },

          'team1': {
            'type': 'object',
            'properties': {
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
        'required': ['matchid', 'team1', 'team2', 'map', 'mode']
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
export function createMatchCfg(matchData, serverId, matchId) {
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
  else if(matchData.mode === 'one vs one') {
      obj = createMatchConfig.create1vs1Config(matchId, team1, team2, team1Name, team2Name, matchData.map);
  }
  else {
      throw 'Invalid game mode';
  }
  fs.writeFile(USER_DIR+'csgo@'+serverId+'/csgo/match.cfg', obj, function(err) {
      if (err) {
          console.log('Error creating match.cfg', err);
      }
  });
}

export function getResultFromJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath.endsWith('.json')) {
      reject('file must be of type json');
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      } 
      
      resolve(JSON.parse(data));
    });
  })
}

export function moveJsonMatchFileToBackupLocation(serverId, matchId) {
  const fileName = `get5_matchstats_${matchId}.json`;
  const filePath = `${USER_DIR}csgo@${serverId}/csgo/${fileName}'`;
  
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


/*************** REMOVE WHEN JSON WORKS ***************/
// Converts valve format match result to string.
export function getResultFromFile(filePath) {
  return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) reject(err);

          var result = vdf.parse(data);
          resolve(result);
      });
  })
}

/*************** REMOVE WHEN JSON WORKS ***************/
// Move match files to backup location
// Remove match files
export function moveMatchFiles(serverId, matchId) {
  var fileName = USER_DIR+'csgo@'+serverId+'/csgo/get5_matchstats_'+matchId+'.cfg';
  createBackupLocationIfNonExistent();
  // Move file
  fs.rename(fileName, USER_DIR+'/matchfiles/get5_matchstats_'+matchId+'.cfg', function(error){
    if(error)
      console.log(error);
    });
  // Delete unnecessary files
  deleteUnecessaryMatchFiles(serverId);
}

/*************** REMOVE WHEN JSON WORKS ***************/
// Delete unnecessary files
function deleteUnecessaryMatchFiles(serverId) {
  glob(USER_DIR+'csgo@'+serverId+'/csgo/get5_matchstats_*.cfg', function (err, files) {
    // files is an array of filenames matching the wildcard (*).
    if (err) {
      console.log(err);
    } else {
      for (const file of files) {
        fs.unlink(file, (err) => {
          if(err) {
            console.log(err);
          }
        })
      }
    }
 })
   glob(USER_DIR+'csgo@'+serverId+'/csgo/get5_backup_match*.cfg', function (err, files) {
     // files is an array of filenames matching the wildcard (*).
     if (err) {
       console.log(err);
     } else {
       for (const file of files) {
         fs.unlink(file, (err) => {
           if(err) {
             console.log(err);
           }
         })
       }
     }
  })
  glob(USER_DIR+'csgo@'+serverId+'/csgo/backup_round*.txt', function (err, files) {
    // files is an array of filenames matching the wildcard (*).
    if (err) {
      console.log(err);
    } else {
        for (const file of files) {
          fs.unlink(file, (err) => {
            if(err) {
              console.log(err);
            }
          })
        }
      }
   })
}

/*************** REMOVE WHEN JSON WORKS ***************/
// Check if the directory exist
// If not, create it
function createBackupLocationIfNonExistent() {
  var _dirPath = USER_DIR+'matchfiles';
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


/**
* Convert team list of format ['id1', 'id2'] to {'id1': '', 'id2': ''}
*/
function teamListToObj(list) {
    return list.reduce(
        (acc, id) => Object.assign(acc, {[id]: '' }),
        {});
}
