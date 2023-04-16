export function checkEnv() {
  const {
    CSGO_MULTI_SERVER_PATH,
    FAKE_MULTI_SERVER_PATH,
    SERVER_ADDRESS,
    CSGO_SERVERS_PATH,
    FAKE_SERVERS_PATH,
    CSGO_TEAMS_PATH
  } = process.env;
  const useFakeServers = process.argv.includes("fake");

  if (!SERVER_ADDRESS) {
    throw Error("SERVER_ADDRESS was not provided in .env file");
  }
  if (!CSGO_SERVERS_PATH) {
    throw Error();
  }
  if (useFakeServers && !FAKE_MULTI_SERVER_PATH) {
    throw Error("FAKE_MULTI_SERVER_PATH was not provided in .env file");
  }
  if (useFakeServers && !FAKE_SERVERS_PATH) {
    throw Error("FAKE_SERVERS_PATH was not provided in .env file");
  }
  if (!useFakeServers && !CSGO_MULTI_SERVER_PATH) {
    throw Error("CSGO_MULTI_SERVER_PATH was not provided in .env file");
  }
  if (!CSGO_TEAMS_PATH) {
    throw Error("CSGO_TEAMS_PATH was not provided in .env file");
  }
}

export function getServersPath() {
  const { CSGO_SERVERS_PATH, FAKE_SERVERS_PATH } = process.env;
  const useFakeServers = process.argv.includes("fake");

  return useFakeServers ? FAKE_SERVERS_PATH : CSGO_SERVERS_PATH;
}
