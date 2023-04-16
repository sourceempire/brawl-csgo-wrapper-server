import { spawn, SpawnOptions } from "child_process";
import schedule from "node-schedule";
import { Get5MatchTeam, MatchData, Team } from "./types/config";

type ServerId = string;

type ServerInfo = {
  port: number;
  isAvalable: boolean;
};

const useFakeServers = process.argv.includes("fake");

const spawnOptions: SpawnOptions = {
  cwd: useFakeServers
    ? process.env.FAKE_MULTI_SERVER_PATH
    : process.env.CSGO_MULTI_SERVER_PATH,
  stdio: ["inherit"], // attatch tty (csgo-multiserver requirement)
  windowsVerbatimArguments: true,
};

let isServerUpdating = false;
checkIfUpdateNeeded();
schedule.scheduleJob("10 7 10 * * *", checkIfUpdateNeeded);

const servers = createServerInfoList({ serverCount: 5 });

function checkIfUpdateNeeded() {
  try {
    isServerUpdating = true;
    console.log("Updating server");
    const updateProcess = spawn("./csgo-server", ["update"], spawnOptions);
    updateProcess.on("close", () => {
      // when update is done
      isServerUpdating = false;
    });
  } catch (e) {
    console.log("Failed to update!", e);
  }
}

function createServerInfoList({ serverCount }: { serverCount: number }) {
  const servers: Record<ServerId, ServerInfo> = {};
  for (var i = 1; i <= serverCount; i++) {
    servers["csgo" + i] = {
      isAvalable: true,
      port: 27014 + i,
    };
  }
  return servers;
}

function getAvailableServer() {
  var keys = Object.keys(servers);
  for (var i = 0; i < keys.length; i++) {
    var serverId = keys[i];
    if (servers[serverId].isAvalable) {
      return serverId;
    }
  }
  return null;
}

function setServerUnavailable(serverId: ServerId) {
  servers[serverId].isAvalable = false;
}

export function createCSGOMatch(matchData: MatchData) {
  const serverId = getAvailableServer();

  if (serverId === null) {
    throw Error("no_servers_available");
  }

  setServerUnavailable(serverId);

  const numberOfMaps = ["-nm", "1"];
  const playersPerTeam = [
    "-ppt",
    `${getPlayersPerTeam(matchData.team1, matchData.team2)}`,
  ];
  const coachesPerTeam = ["-cpt", "0"];
  const matchId = ["-id", matchData.matchId];
  const sideType = ["-st", "never_knife"];
  const wingman = matchData.mode === "wingman" ? ["-w"] : [];
  const team1 = ["-t1", matchData.team1.teamId];
  const team2 = ["-t1", matchData.team2.teamId];
  const mapList = ["-ml", matchData.map];
  const cvars = ["-cv", matchData.matchId];

  try {
    const createMatchChildProcess = spawn(
        "./csgo-server",
        [
          `@${serverId}`,
          "exec",
          "get5_creatematch",
          "--skip_veto",
          ...numberOfMaps,
          ...playersPerTeam,
          ...coachesPerTeam,
          ...matchId,
          ...sideType,
          ...wingman,
          ...team1,
          ...team2,
          ...mapList,
          ...cvars,
        ],
        spawnOptions
      );
    
      return new Promise<void>((resolve, reject) => {
        createMatchChildProcess.on("close", () => {
          resolve();
        });
        createMatchChildProcess.on("error", (error) => {
          reject(error);
        });
      });
  } catch (error) {
    return Promise.reject(error)
  }
  
}

function getPlayersPerTeam(team1: Team, team2: Team) {
  if (team1.players.length !== team2.players.length) {
    throw Error("The number of players on each team must be equal");
  }

  return team1.players.length;
}
