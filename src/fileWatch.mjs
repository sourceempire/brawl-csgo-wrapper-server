import watchman from 'fb-watchman';
import { getResultFromFile } from './fileHandler.mjs';

const client = new watchman.Client();

var USER_DIR = "/home/steam/";

// Starting WATCHMAN
// serverId and matchId as parameters to be able to locate right csgo game and server
export function watchForResult(serverId, matchId, callback) {

  // Setting the dir_of_interest
  // In this case the directory of each csgo server
  var csgoWatch = USER_DIR+"csgo@"+serverId+"/csgo";

  /* CHECKING FOR WATCHMAN AVAILABILITY */
  // Make a capabilityCheck with a function response
  client.capabilityCheck({optional:[], required:[]},
    function (error, resp) {
      if (error) {
        console.log(error);
        client.end();
        return;
      }

      // Initiate the watch on the given path
      client.command(['watch-project', csgoWatch],
        function (error, resp) {
          if (error) {
            console.error('Error initiating watch:', error);
            return;
          }

          // Warning or error message
          if ('warning' in resp) {
            console.log('warning: ', resp.warning);
          }

          // TAKE AWAY AFTER TESTING
          // TAKE AWAY AFTER TESTING
          // TAKE AWAY AFTER TESTING
          console.log('watch established on ', resp.watch,
                    ' relative_path', resp.relative_path);
          console.log(resp)

          // Run the subscripiton function
          make_subscription(client, resp.watch, resp.relative_path, serverId, matchId, callback);
        });
      }
    );
  }

  /* SUBSCRIBING TO CHANGES */
  // Client is obtained from the new client created in the beginning of file
  // Watch is obtained from resp.watch in the watch-project response from above.
  // Relative_path is obtained from resp.relative_path in the watch-project response from above.
  //
  // The both resp(responses) is something that you get when you do the watch-project
  // So you can reach this responses with the command resp.watch, resp.relative_path
  function make_subscription(client, watch, relative_path, serverId, matchId, callback) {
    sub = {
      // Match the files in the dir_of_interest.
      // Match can be "*.js", ".txt" etc
      // Can do ["match", "*"], ["not", "empty"]
      expression: ["allof", ["match", "get5_matchstats_"+matchId+".cfg"]],
      // Which fields we're interested in
      fields: ["name", "exists"]
    };
    if (relative_path) {
      sub.relative_root = relative_path;
    }

    // Make a subscribe with a function response
    client.command(['subscribe', watch, 'result_file_subscription_'+serverId, sub],
      function (error, resp) {
        if (error) {
          // Probably an error in the subscription criteria
          console.error('failed to subscribe: ', error);
          return;
        }
      });

    client.on('subscription', function (resp) {
      if (resp.subscription !== 'result_file_subscription_'+serverId) return;

      resp.files.forEach(function (file) {
        if (file.exists === false) {
            // file has been removed
        } else {
            // file has been added or changed
            var path = relative_path ? relative_path+"/"+file.name : watch+"/"+file.name
            console.log('Changed in file: '+path)
            getResultFromFile(path).then((result) =>{
              if(result.Stats.winner !== undefined){
                console.log("Found winner")
                callback(path);
              }
            }).catch((err)=>{
              console.log("File not readable: "+path)
            });      
        }
      });
    });
}

// Stop a subscription for the file that we do the watch on
export function stopWatchForResult(serverId) {
  var csgoPath = USER_DIR+"csgo@"+serverId+"/csgo";

  client.command(['unsubscribe', csgoPath, 'result_file_subscription_'+serverId],
    function (error, resp) {
      if (error) {
        // Probably an error in the unsubscription criteria
        console.error('failed to unsubscribe: ', error);
        return;
      } else {
        console.log('unsubscribed');
        return;
    }
  });
};