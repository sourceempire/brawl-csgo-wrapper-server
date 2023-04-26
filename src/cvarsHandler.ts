import fs from 'fs/promises';
import { logAddress } from './constants.js';
import { MatchId } from './types/common';

type CVars = Record<string, string | number>

const cvarsFilePath = process.env.CSGO_CVARS_PATH as string;

const defaultCvars = {
    get5_reset_cvars_on_end: 0,
    get5_stop_command_enabled: 0,
    get5_hostname_format: '{TEAM1} vs {TEAM2}',
    get5_message_prefix: '[{ORANGE}Brawl Gaming{NORMAL}]',
    get5_remote_log_url: logAddress,

    sm_practicemode_can_be_started: 0,
}

const queue: (() => Promise<void>)[] = [];
let isProcessing = false;

async function readCvarsFile(): Promise<Record<MatchId, CVars>> {
  const data = await fs.readFile(cvarsFilePath, 'utf8');
  return JSON.parse(data);
}

async function writeCvarsFile(cvars: Record<MatchId, CVars>): Promise<void> {
  const updatedJson = JSON.stringify(cvars, null, 2);
  await fs.writeFile(cvarsFilePath, updatedJson, 'utf8');
}

async function addCvars(matchId: MatchId, cvars: CVars): Promise<void> {
  const allCvars = await readCvarsFile();
  allCvars[matchId] = cvars;
  await writeCvarsFile(allCvars);
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

async function addCvarsToQueue(matchId: MatchId, cvars?: CVars): Promise<void> {
  console.log({matchId});
  return new Promise<void>((resolve) => {
    queue.push(async () => {
      await addCvars(matchId, {...defaultCvars, ...cvars, get5_server_id: matchId});
      resolve();
    });
    processQueue();
  });
}

export default {
    addCvarsToQueue,
};