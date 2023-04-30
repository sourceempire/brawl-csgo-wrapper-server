import { spawn, SpawnOptions } from 'child_process';
import schedule from 'node-schedule';
import { MatchData, Team } from './types/config.js';
import teamHandler from './teamHandler.js';
import cvarsHandler from './cvarsHandler.js';
import * as connectedPlayerCountHandler from './handlers/connectedPlayerCountHandler.js';

type ServerId = string;

type ServerInfo = {
  port: number;
  isAvalable: boolean;
};

const useFakeServers = process.argv.includes('fake');

const spawnOptions: SpawnOptions = {
  cwd: useFakeServers
    ? process.env.FAKE_MULTI_SERVER_PATH
    : process.env.CSGO_MULTI_SERVER_PATH,
  stdio: ['inherit'], // attatch tty (csgo-multiserver requirement)
  windowsVerbatimArguments: true,
};

let isServerUpdating = false;
checkIfUpdateNeeded();
schedule.scheduleJob('10 7 10 * * *', checkIfUpdateNeeded);

const servers = createServerInfoList({ serverCount: 5 });


export async function createCSGOMatch(matchData: MatchData) {
  const serverId = getAvailableServer();

  if (serverId === null) {
    throw Error('no_servers_available');
  }

  setServerUnavailable(serverId);

  const serverAndMatchId = `${serverId}_${matchData.matchId}`
  const playersPerTeam = getPlayersPerTeam(matchData.team1, matchData.team2);

  connectedPlayerCountHandler.addTracker(serverAndMatchId, { players: [...Object.keys(matchData.team1.players), ...Object.keys(matchData.team2.players)] })

  await teamHandler.addTeamToQueue(matchData.team1);
  await teamHandler.addTeamToQueue(matchData.team2);
  await cvarsHandler.addCvarsToQueue(serverAndMatchId);

  await startServer(serverId);

  const numberOfMaps = ['-nm', '1'];
  const ppt = ['-ppt', `${playersPerTeam}`];
  const skipVeto = ['-sv']
  const coachesPerTeam = ['-cpt', '0'];
  const matchId = ['-id', serverAndMatchId];
  const sideType = ['-st', 'never_knife'];
  const wingman = matchData.mode === 'wingman' ? ['-w'] : [];
  const team1 = ['-t1', matchData.team1.id];
  const team2 = ['-t2', matchData.team2.id];
  const mapList = ['-ml', matchData.map];
  const cvars = ['-cv', serverAndMatchId];

  try {
    const createMatchChildProcess = spawn(
      './csgo-server',
      [
        `@${serverId}`,
        'exec',
        'get5_creatematch',
        ...skipVeto,
        ...numberOfMaps,
        ...ppt,
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
      createMatchChildProcess.on('close', () => {
        resolve();
      });
      createMatchChildProcess.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    return Promise.reject(error)
  }

}

function checkIfUpdateNeeded() {
  try {
    isServerUpdating = true;
    console.log('Updating server');
    const updateProcess = spawn('./csgo-server', ['update'], spawnOptions);
    updateProcess.on('close', () => {
      // when update is done
      isServerUpdating = false;
      console.log('Update done')
    });
  } catch (e) {
    console.log('Failed to update!', e);
  }
}

function createServerInfoList({ serverCount }: { serverCount: number }) {
  const servers: Record<ServerId, ServerInfo> = {};
  for (let i = 1; i <= serverCount; i++) {
    servers['csgo' + i] = {
      isAvalable: true,
      port: 27014 + i,
    };
  }
  return servers;
}

function getAvailableServer() {
  const keys = Object.keys(servers);
  for (let i = 0; i < keys.length; i++) {
    const serverId = keys[i];
    if (servers[serverId].isAvalable) {
      return serverId;
    }
  }
  return null;
}

function setServerUnavailable(serverId: ServerId) {
  servers[serverId].isAvalable = false;
}

export function getServerAddress(serverId: ServerId) {
  return `${process.env.SERVER_ADDRESS}:${servers[serverId].port}`
}

function getPlayersPerTeam(team1: Team, team2: Team) {
  if (Object.keys(team1.players).length !== Object.keys(team2.players).length) {
    throw Error('The number of players on each team must be equal');
  }

  return Object.keys(team1.players).length;
}



/***** Commands *****/

function startServer(serverId: ServerId): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Starting server ${serverId}`)
      const start = spawn('./csgo-server', ['@' + serverId, 'start'], spawnOptions);

      start.on('close', () => {
        resolve();
      })

      start.on('error', (error) => {
        reject(error)
      })
    } catch (error) {
      reject(error);
    }
  })
}

// TODO -> Handle error, and convert to return Promise.
export function sendAlertMessage(serverId: string, message: string) {
  const csayCmd = spawn(
    './csgo-server',
    ['@' + serverId, 'exec', 'sm_csay', message],
    spawnOptions
  );
}

// TODO -> Handle error, and convert to return Promise.
export function forceStartMatch(serverId: string) {
  const forceReadyCmd = spawn(
    './csgo-server',
    ['@' + serverId, 'exec', 'get5_forcestart'],
    spawnOptions
  );

  forceReadyCmd.on('close', () => {
    console.log('Force started match');
  });
}