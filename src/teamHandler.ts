import fs from 'fs/promises';
import { Team } from './types/config';

type ConfigTeam = Omit<Team, 'teamId'>

const teamsFilePath = process.env.CSGO_TEAMS_PATH as string;

if (!teamsFilePath) throw Error("")

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;

async function readTeamsFile(): Promise<Record<string, Omit<ConfigTeam, "teamId">>> {
  const data = await fs.readFile(teamsFilePath, 'utf8');
  return JSON.parse(data);
}

async function writeTeamsFile(teams: Record<string, ConfigTeam>): Promise<void> {
  const updatedJson = JSON.stringify(teams, null, 2);
  await fs.writeFile(teamsFilePath, updatedJson, 'utf8');
}

async function addTeam(team: Team): Promise<void> {
  const teams = await readTeamsFile();

  const configTeam: ConfigTeam = {
    name: team.name,
    players: team.players,
  }
  
  teams[team.teamId] = configTeam;
  await writeTeamsFile(teams);
}

async function processQueue(): Promise<void> {
  if (isProcessing) {
    return;
  }

  if (queue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const task = queue.shift();
  if (task) {
    await task();
    isProcessing = false;
    processQueue();
  }
}

async function addTeamToQueue(team: Team): Promise<void> {
  return new Promise<void>((resolve) => {
    queue.push(async () => {
      await addTeam(team);
      resolve();
    });
    processQueue();
  });
}

export default {
  addTeamToQueue,
};