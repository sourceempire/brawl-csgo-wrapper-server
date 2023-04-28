import { logAddress } from './constants.js';
import { Get5Match, Get5MatchTeam } from './types/config';

const matchStatsFileName = 'matchstats_{MATCHID}.json';

export const getMatchStatsFileName = (matchId: string) => {
    return matchStatsFileName.replace('{MATCHID}', matchId)
}

const gameModes = {
    competitive: {
        game_type: 0,
        game_mode: 1,
    },
    wingman: {
        game_type: 0,
        game_mode: 2,
    },
    deathmatch: {
        game_type: 1,
        game_mode: 2,
    }
}

const roundsConfig = {
    competitive: {
        mp_halftime: 15,
        mp_maxrounds: 30,
    },
    wingman: {
        mp_halftime: 8,
        mp_maxrounds: 16,
    }
}

const sharedMatchConfig: Omit<Get5Match, 'matchid' | 'maplist' | 'team1' | 'team2' | 'num_maps' | 'players_per_team'>  = {
    skip_veto: true,
    side_type: 'never_knife',
}

const sharedCvars: Get5Match['cvars'] = {
    mp_halftime_duration: 15,
    get5_remote_log_url: logAddress,
    get5_stop_command_enabled: 0,
    get5_hostname_format: '{TEAM1} vs {TEAM2}',
    get5_message_prefix: '[{ORANGE}Brawl Gaming{NORMAL}]',  
    get5_stats_path_format: matchStatsFileName,
    sm_practicemode_can_be_started: 0,
    // get5_demo_path: 'demos/{DATE}/',
}


export function createCompetetiveConfig(matchId: string, team1: Get5MatchTeam, team2: Get5MatchTeam, map: string) {
    if (team1.players.length !== team2.players.length) {
        throw Error('The number of players on each team must be equal');
    }

    return {
        ...sharedMatchConfig,
        matchid: matchId,
        num_maps: 1,
        players_per_team: getPlayersPerTeam(team1, team2), // required to know when everyone is connected
        maplist: [map],
        team1,
        team2,
        cvars: {
            ...gameModes.competitive,
            ...sharedCvars,
            ...roundsConfig.competitive
        }
    };
}

export function createWingmanConfig(matchId: string, team1: Get5MatchTeam, team2: Get5MatchTeam, map: string){
    return {
        ...sharedMatchConfig,
        matchid: matchId,
        num_maps: 1,
        players_per_team: getPlayersPerTeam(team1, team2), // required to know when everyone is connected
        maplist: [map],
        team1,
        team2,
        cvars: {
            ...gameModes.wingman,
            ...sharedCvars,
            ...roundsConfig.wingman,
        }
    };
}

function getPlayersPerTeam( team1: Get5MatchTeam, team2: Get5MatchTeam) {
    if (team1.players.length !== team2.players.length) {
        throw Error('The number of players on each team must be equal');
    }

    return team1.players.length
}
