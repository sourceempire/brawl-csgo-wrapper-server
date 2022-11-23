import { logaddress } from './constants';
import { Get5Match, Get5PlayerSet } from './types/get5';


const gameModes = {
    competitive: {
        'game_type': '0',
        'game_mode': '1',
    },
    wingman: {
        'game_type': '0',
        'game_mode': '2',
    },
    deathmatch: {
        'game_type': '1',
        'game_mode': '2',
    }
}

export function createWingmanConfig(matchId, team1, team2, team1Name, team2Name, map){
    return {
        'matchid': matchId,
        'skip_veto': 1,
        'num_maps':  1,
        'side_type': 'never_knife',
        'players_per_team': 2, // required to auto start when all players joined
        'maplist':
        {
            [map]: ''
        },
        'team1': {
            'name': team1Name,
            'players': team1
        },
        'team2':{
            'name': team2Name,
            'players': team2
        },
        'cvars': {
            ...gameModes.wingman,
            'mp_force_pick_time': 0,
            'mp_maxmoney': 8000,
            'mp_maxrounds': 16,
            'mp_halftime': 8,
            'mp_do_warmup_period': 0,
            'mp_freezetime': 10,
            'mp_roundtime':	1.5,
            'mp_halftime_duration': 15,
            'mp_roundtime_hostage':	1.5,
            'mp_roundtime_defuse':	1.5,
            'cash_team_elemenation_bomb_map': 2750,
            'cash_team_elimination_hostage_map_t': 2500,
            'cash_team_elimination_hostage_map_ct': 2500,
            'cash_team_loser_bonus': 2000,
            'cash_team_loser_bonus_consecutive_rounds': 300,
            'cash_team_terrorist_win_bomb': 3000,
            'cash_team_win_by_defusing_bomb': 3000,
            'cash_team_win_by_time_running_out_hostage': 2750,
            'cash_team_win_by_time_running_out_bomb': 2750,
            'mp_match_restart_delay': 300,
            'hostname': 'Brawl Gaming Server',
            'get5_stats_path_format': `get5_matchstats_${matchId}.json`,
        }
    }
}

export function createCompetetiveConfig(matchId, team1, team2, team1Name, team2Name, map){
    return {
        'matchid': matchId,
        'skip_veto': 1,
        'num_maps':  1,
        'side_type': 'never_knife',
        'players_per_team': 5, // required to auto start when all players joined
        'maplist':
        {
            [map]: ''
        },
        'team1': {
            'name': team1Name,
            'players': team1
        },
        'team2':{
            'name': team2Name,
            'players': team2
        },
        'cvars': {
            'game_type': 0,
            'game_mode': 1, 
            'mp_do_warmup_period': 0,
            'hostname': 'Brawl Gaming Server',
            'mp_halftime_duration': '15',
            'get5_stats_path_format': `get5_matchstats_${matchId}.json`,
        }
    };
}

export function createDeathmatchConfig(matchId, team1, team2, team1Name, team2Name, map){
    return {
        'matchid': matchId,
        'skip_veto': 1,
        'num_maps':  1,
        'side_type': 'never_knife',
        'maplist':
        {
            [map]: ''
        },
        'team1': {
            'name': team1Name,
            'players': team1
        },
        'team2':{
            'name': team2Name,
            'players': team2
        },
        'cvars': {
            ...gameModes.competitive,
            'mp_force_pick_time': 0,
            'mp_maxrounds': 2,
            'sv_disable_show_team_select_menu': 1,
            'mp_halftime': 1,
            'mp_endmatch_votenextmap': 0,
            'mp_endmatch_votenextleveltime': 20,
            'mp_endmatch_votenextmap_keepcurrent': 0,
            'hostname': 'Brawl Gaming Server',
            'get5_stats_path_format': `get5_matchstats_${matchId}.json`,
        }
    };
}

export const create1vs1Config = (
    matchId: string, 
    team1: Get5PlayerSet,
    team2: Get5PlayerSet, 
    team1Name: string, 
    team2Name: string, 
    map: string
): Get5Match => ({
    match_title: `${team1Name} vs ${team2Name}`,
    matchid: matchId,
    clinch_series: false,
    num_maps: 1,
    players_per_team: 1, // required to auto start when all players joined
    skip_veto: true,
    side_type: 'always_knife', // Last time playing, weapons weren't dropped on knife-round
    maplist: [map],
    team1: {
        name: team1Name,
        players: team1
    },
    team2:{
        name: team2Name,
        players: team2
    },
    // not sure if numbers or strings should be provided
    cvars: {
        ...gameModes.wingman,
        hostname: 'Brawl Gaming Server',
        mp_halftime: 1,
        mp_maxrounds: 2,
        get5_remote_log_url: logaddress,
        get5_stop_command_enabled: 0,
        
        
    
        // BELOW NOT TESTED
        get5_stats_path_format: `get5_matchstats_${matchId}.json`,
        mp_warmup_pausetimer: 0,
        mp_warmuptime: 300,
        mp_warmuptime_all_players_connected: 30, // Warmup time to use when all players have connected. 0 to disable.
        sm_practicemode_can_be_started: 0,
        mp_endmatch_votenextmap: 0
    }
})
