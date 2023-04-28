import { 
    Get5MapEvent, 
    Get5MatchEvent, Get5Player,
    Get5RoundEvent,
    Get5StatsTeam,
    Get5TeamWrapper,
    Get5TimedRoundEvent,
    Get5Winner 
} from './__generated/index.js';

export type Get5_OnSeriesInit = Get5MatchEvent & {
    event: 'series_start';
    num_maps: number; // >= 1, The number of maps in the series, i.e. 3 for a Bo3. NumberOfMaps in SourceMod.
    team1: Get5TeamWrapper;
    team2: Get5TeamWrapper;
}

export type Get5_OnPlayerConnected = Get5MatchEvent & {
    event: 'player_connect',
    player: Get5Player,
    ip_address: string,
}

export type Get5_OnMapResult = Get5MapEvent & {
    event: 'map_result';
    team1: Get5StatsTeam;
    team2: Get5StatsTeam;
    winner: Get5Winner;
}

export type Get5_OnSeriesResult = Get5MatchEvent & {
    event: 'series_end';
    team1_series_score: number; // >= 0, The map/series score of team1. Team1SeriesScore in SourceMod.
    team2_series_score: number; // >= 0, The map/series score of team2. Team1SeriesScore in SourceMod.
    winner: Get5Winner;
    time_until_restore: number; // >= 0, The number of seconds until Get5 restores any changed ConVars and resets its game state to none after the series has ended.
}

export type Get5_OnGoingLive = Get5MapEvent & {
    event: 'going_live';
}

export type Get5_OnRoundStart = Get5RoundEvent & {
    event: 'round_start';
}

export type Get5_OnRoundEnd =  Get5TimedRoundEvent & {
    event: 'round_end';
    reason: number; // >= 0, The reason for the round ending. Reason in SourceMod. See https://sourcemod.dev/#/cstrike/enumeration.CSRoundEndReason.
    winner: Get5Winner;
    team1: Get5StatsTeam;
    team2: Get5StatsTeam;
}


export type Get5_Event = 
    | Get5_OnSeriesInit 
    | Get5_OnPlayerConnected 
    | Get5_OnMapResult 
    | Get5_OnSeriesResult 
    | Get5_OnGoingLive 
    | Get5_OnRoundStart 
    | Get5_OnRoundEnd;