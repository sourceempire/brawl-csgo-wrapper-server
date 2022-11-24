import { ClientActionEventName, LiveEventName, MapFlowEventName, SeriesFlowEventName } from "./eventEnums";

/**
 * The map number in the series, starting at 0.
 */
export type MapNumber = number;

/**
 * The round number of the map, starting at 0.
 */
export type RoundNumber = number;

/**
 * The name of the file containing the GOTV recording of the map. 
 * The format is determined by the get5_demo_name_format parameter.
 */
export type DemoFilename = string;


export enum GameState {
    NONE = "none", 
    PRE_VETO = "pre_veto", 
    VETO = "veto", 
    WARMUP= "warmup", 
    KNIFE= "knife", 
    WAITING_FOR_KNIFE_DECISION = "waiting_for_knife_decision", 
    GOING_LIVE= "going_live",
    LIVE= "live", 
    POST_GAME= "post_game",
}

export enum Side {
    CT = "ct",
    T = "t",
}

export enum Team {
    TEAM1 = "team1",
    TEAM2 = "team2",
}

export interface Winner {
    side: Side
    team: Team
}

export interface Get5Event {
    event: SeriesFlowEventName | MapFlowEventName | LiveEventName | ClientActionEventName
}

export * from "./eventEnums"
export * from "./clientActionEvents";
export * from "./liveEvents";
export * from "./mapFlowEvents";
export * from "./seriesFlowEvents";