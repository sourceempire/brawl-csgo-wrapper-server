import { Get5EventName } from "./eventEnums";

/**
 * UUID
 */
export type MatchId = string;

/**
 * The map number in the series, starting at 0.
 */
export type MapNumber = number;

/**
 * The round number of the map, starting at 0.
 */
export type RoundNumber = number;

/**
 * The number of milliseconds into the round the event occurred.
 */
export type RoundTime = number;

/**
 * The in-game user ID of the player. This uniquely identifies the 
 * player within a server and is auto-incremented for each connecting 
 * player. 0 for GOTV/Console but >0 for all players or bots. If the 
 * same player reconnects, they will be given a new ID. steamid 
 * uniquely identifies the player outside the server.
 */
export type UserId = number;

/**
 * The SteamID64 of the player. GetSteamId() and SetSteamId() in 
 * SourceMod. This will be BOT-%d if the player is a bot, where %d is 
 * the user ID (user_id). The string will be empty for Console and 
 * GOTV (although we should never see this in practice).
 */
export type SteamId = string;

/**
 * The in-game name of the player. If the player is a bot, this will 
 * be "BOT Gary" etc.
 */
export type PlayerName = string;

/**
 * The in-game console name of the weapon used.
 */
export type WeaponName = string;

/**
 * The weapon ID used. See https://sm.alliedmods.net/new-api/cstrike/CSWeaponID 
 * Id in SourceMod. Some weapons are ID 0, such as the C4 bomb explosion or 
 * molotov/incendiary fire.
 */
export type WeaponId = number;

/**
 * 	The site at which the bomb was planted/defused or exploded.
 */
export type BombSite = "a" | "b";

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
    SPEC = "spec",
}

export enum Team {
    TEAM1 = "team1",
    TEAM2 = "team2"
}

export enum PauseType {
    TACTIVAL = "tactical", 
    TECHNICAL = "technical", 
    ADMIN = "admin", 
    BACKUP = "backup"
}

export enum SayCommand {
    SAY = "say", 
    SAY_TEAM = "say_team" 
}

export interface Winner {
    side: Side
    team: Team
}

export interface Player {
    user_id: UserId,
    steamid: SteamId,
    side: Side,
    name: PlayerName,
    is_bot: boolean
}

export interface Weapon {
    name: WeaponName, 
    id: WeaponId,
}

/**
 * Describes an assist to a kill. null if no assister.
 */
export interface Assist {
    player: Player,
    friendly_fire: boolean,
    flash_assist: boolean
}

export interface Victim {
    player: Player,
    friendly_fire: boolean;
}

export interface BlindedGrenadeVictim extends Victim {
    blind_duration: number
}

export interface DamageGrenadeVictim extends Victim {
    damage: number
    killed: boolean
}

export interface Get5Event {
    event: Get5EventName
    matchid: string;
}

export * from "./eventEnums.js"
export * from "./clientActionEvents.js";
export * from "./liveEvents.js";
export * from "./mapFlowEvents.js";
export * from "./seriesFlowEvents.js";
