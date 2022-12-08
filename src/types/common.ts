/**
 * The SteamID64 of the player. GetSteamId() and SetSteamId() in 
 * SourceMod. This will be BOT-%d if the player is a bot, where %d is 
 * the user ID (user_id). The string will be empty for Console and 
 * GOTV (although we should never see this in practice).
 */
export type SteamId = string 

/**
 * UUID
 */
export type MatchId = string;

/**
 * UUID
 */
export type TeamId = string

export enum SeriesType {
    BEST_OF_1 = "bo1",
    BEST_OF_3 = "bo3",
    BEST_OF_5 = "bo5"
}