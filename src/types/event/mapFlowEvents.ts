import { GameState, Get5Event, MapNumber, PauseType, Side, Team } from ".";
import { MapFlowEventName } from "./eventEnums";

/**
 * Events the occur in relation to a map pick or match-events on a map.
 */
interface MapFlowEvent extends Get5Event {}


interface PauseEvent extends MapFlowEvent {
    matchid: string
    map_number: MapNumber
    team: Team
    pause_type: PauseType
}

/**
 * Fired when the match is paused.
 */
export interface MatchPausedEvent extends PauseEvent {
    event: MapFlowEventName.GAME_PAUSED
}

/**
 * Fired when the match is unpaused.
 */
export interface MatchUnpausedEvent extends PauseEvent {
    event: MapFlowEventName.GAME_UNPAUSED
}

/**
 * Fired when the knife round starts.
 */
export interface KnifeRoundStartedEvent extends MapFlowEvent {
    event: MapFlowEventName.KNIFE_START
    matchid: string
    map_number: MapNumber
}

/**
 * Fired when the knife round is over and the teams have elected to swap or stay. 
 * ***side*** represents the chosen side of the winning team, not the side that won the knife round.
 */
export interface KnifeRoundWonEvent extends MapFlowEvent {
    event: MapFlowEventName.KNIFE_WON
    matchid: string
    map_number: MapNumber
    team: Team
    side: Side
    swapped: boolean
}

/**
 * Fired when a team's ready status changes.
 */
export interface TeamReadyStatusChangedEvent extends MapFlowEvent {
    event: MapFlowEventName.TEAM_READY_STATUS_CHANGED
    matchid: string
    team: Team
    ready: boolean
    game_state: GameState
}

/**
 * Fired when a map is going live.
 */
export interface GoingLiveEvnet extends MapFlowEvent {
    event: MapFlowEventName.GOING_LIVE
    matchid: string
    map_number: MapNumber
}
