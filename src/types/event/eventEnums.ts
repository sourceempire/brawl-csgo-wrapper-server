export enum Get5EventName {
    // Series flow event names
    GAME_STATE_CHANGED = 'game_state_changed',
    PRELOAD_MATCH_CONFIG = 'preload_match_config',
    MATCH_CONFIG_LOAD_FAIL = 'match_config_load_fail',
    SERIES_START = 'series_start',
    MAP_RESULT = 'map_result',
    SERIES_END = 'series_end',
    SIDE_PICKED = 'side_picked',
    MAP_PICKED = 'map_picked',
    MAP_VETOED = 'map_vetoed',
    BACKUP_RESTORE = 'backup_loaded',
    DEMO_FINISHED = 'demo_finished',
    DEMO_UPLOAD_ENDED = 'demo_upload_ended',

    // Map flow event names
    GAME_PAUSED = 'game_paused',
    GAME_UNPAUSED = 'game_unpaused',
    KNIFE_START = 'knife_start',
    KNIFE_WON = 'knife_won',
    TEAM_READY_STATUS_CHANGED = 'team_ready_status_changed',
    GOING_LIVE = 'going_live',

    // Live event names
    ROUND_START = 'round_start',
    ROUND_END = 'round_end',
    STATS_UPDATED = 'stats_updated',
    ROUND_MVP = 'round_mvp',
    GRENADE_THROWN = 'grenade_thrown',
    PLAYER_DEATH = 'player_death',
    HEGRENADE_DETONATED = 'hegrenade_detonated',
    MOLOTOV_DETONATED = 'molotov_detonated',
    FLASHBANG_DETONATED = 'flashbang_detonated',
    SMOKEGRENADE_DETONATED = 'smokegrenade_detonated',
    DECOYGRENADE_STARTED = 'decoygrenade_started',
    BOMB_PLANTED = 'bomb_planted',
    BOMB_DEFUSED = 'bomb_defused',
    BOMB_EXPLODED = 'bomb_exploded',

    // Client action event names
    PLAYER_CONNECTED = 'player_connect',
    PLAYER_DISCONNECTED = 'player_disconnect',
    PLAYER_SAY = 'player_say'
}
