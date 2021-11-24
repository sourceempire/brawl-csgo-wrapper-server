const { watchForResult, stopWatchForResult } = require ('./../src/fileWatch');



function stop_subscription_test () {


  watchForResult("csgo1", "123e4567-e89b-12d3-a456-426655440000", (filePath) => {
    console.log(filePath)
  });

  setTimeout(() => {
    stopWatchForResult("csgo1");
  }, 15*1000)

}


stop_subscription_test();
