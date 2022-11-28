import { 
    DemoFilename, 
    GameState, 
    Get5Event,  
    MapNumber, 
    RoundNumber, 
    SeriesFlowEventName,
    Side, 
    Team, 
    Winner 
} from "."

/**
 * Events the occur in relation to setting up a match or series.
 */
 interface SeriesFlowEvent extends Get5Event {}

 /**
 * Fired when the game state changes.
 */
export interface GameStateChangedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.GAME_STATE_CHANGED
    new_state: GameState
    old_state: GameState
}

/**
 * Fired when the server attempts to load a match config.
 */
export interface PreLoadMatchConfigEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.PRELOAD_MATCH_CONFIG
    filename: string
}

/**
 * Fired when a match config fails to load.
 */
export interface LoadMatchConfigFailedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.MATCH_CONFIG_LOAD_FAIL
    reason: string
}

/**
 * Fired when a series is started after loading a match config.
 */
export interface SeriesInitEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.SERIES_START
    matchid: string
    team1_name: string
    team2_name: string
}

/**
 * Fired when the map ends.
 */
export interface MapResultEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.MAP_RESULT
    matchid: string
    map_number: MapNumber
    team1_score: number
    team2_score: number
    winner: Winner
}

/**
 * Fired when a series is over.
 */
export interface SeriesResultEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.SERIES_END
    matchid: string
    team1_series_score: number
    team2_series_score: number
    winner: Winner
    time_until_restore: number
}

/**
 * Fired when a side is picked by a team.
 */
export interface SidePickedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.SIDE_PICKED
    matchid: string
    team: Team
    map_name: string
    side: Side
    map_number: MapNumber
}

/**
 * Fired when a team picks a map.
 */
export interface MapPickedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.MAP_PICKED
    matchid: string
    team: Team
    map_name: string
    map_number: MapNumber
}

/**
 * Fired when a team vetos a map.
 */
export interface MapVetoedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.MAP_VETOED
    matchid: string
    team: Team
    map_name: string
}

/**
 * Fired when a round is restored from a backup. Note that the map 
 * and round numbers indicate the round being restored to, not the 
 * round the backup was requested during.
 */
export interface BackupRestoreEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.BACKUP_RESTORE
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    filename: string
}

/**
 * Fired when the GOTV recording has ended. This event does not fire 
 * if no demo was recorded.
 */
export interface DemoFinishedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.DEMO_FINISHED
    matchid: string
    map_number: MapNumber
    filename: DemoFilename
}

/**
 * Fired when the request to upload a demo ends, regardless if it 
 * succeeds or fails. If you upload demos, you should not shut down
 * a server until this event has fired.
 * 
 * example: 1324_map_0_de_nuke.dem
 */
export interface DemoUploadEndedEvent extends SeriesFlowEvent {
    event: SeriesFlowEventName.DEMO_UPLOAD_ENDED
    matchid: string
    map_number: MapNumber
    filename: DemoFilename
    success: boolean
}
