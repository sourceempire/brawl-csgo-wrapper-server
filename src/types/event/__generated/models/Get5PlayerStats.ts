/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * The stats of the player.
 */
export type Get5PlayerStats = {
    /**
     * The number of kills the player had. `Kills` in SourceMod.
     */
    kills: number;
    /**
     * The number of deaths the player had. `Deaths` in SourceMod.
     */
    deaths: number;
    /**
     * The number of assists the player had. `Assists` in SourceMod.
     */
    assists: number;
    /**
     * The number of flashbang assists the player had. `FlashAssists` in SourceMod.
     */
    flash_assists: number;
    /**
     * The number of team-kills the player had. `TeamKills` in SourceMod.
     */
    team_kills: number;
    /**
     * The number of suicides the player had. `Suicides` in SourceMod.
     */
    suicides: number;
    /**
     * The total amount of damage the player dealt. `Damage` in SourceMod.
     */
    damage: number;
    /**
     * The total amount of damage the player dealt via utility. `UtilityDamage` in SourceMod.
     */
    utility_damage: number;
    /**
     * The number of enemies flashed by the player. `EnemiesFlashed` in SourceMod.
     */
    enemies_flashed: number;
    /**
     * The number of teammates flashed by the player. `FriendliesFlashed` in SourceMod.
     */
    friendlies_flashed: number;
    /**
     * The number kills the player had with a knife. `KnifeKills` in SourceMod.
     */
    knife_kills: number;
    /**
     * The number kills the player had that were headshots. `HeadshotKills` in SourceMod.
     */
    headshot_kills: number;
    /**
     * The number of rounds the player started. `RoundsPlayed` in SourceMod.
     */
    rounds_played: number;
    /**
     * The number of times the player defused the bomb. `BombDefuses` in SourceMod.
     */
    bomb_defuses: number;
    /**
     * The number of times the player planted the bomb. `BombPlants` in SourceMod.
     */
    bomb_plants: number;
    /**
     * The number of rounds where the player killed 1 opponent. `Kills1` in SourceMod.
     */
    '1k': number;
    /**
     * The number of rounds where the player killed 2 opponents. `Kills2` in SourceMod.
     */
    '2k': number;
    /**
     * The number of rounds where the player killed 3 opponents. `Kills3` in SourceMod.
     */
    '3k': number;
    /**
     * The number of rounds where the player killed 4 opponents. `Kills4` in SourceMod.
     */
    '4k': number;
    /**
     * The number of rounds where the player killed 5 opponents. `Kills5` in SourceMod.
     */
    '5k': number;
    /**
     * The number of 1v1s the player won. `OneV1s` in SourceMod.
     */
    '1v1': number;
    /**
     * The number of 1v2s the player won. `OneV2s` in SourceMod.
     */
    '1v2': number;
    /**
     * The number of 1v3s the player won. `OneV3s` in SourceMod.
     */
    '1v3': number;
    /**
     * The number of 1v4s the player won. `OneV4s` in SourceMod.
     */
    '1v4': number;
    /**
     * The number of 1v5s the player won. `OneV5s` in SourceMod.
     */
    '1v5': number;
    /**
     * The number of rounds where the player had the first kill in the round while playing the T side. `FirstKillsT` in SourceMod.
     */
    first_kills_t: number;
    /**
     * The number of rounds where the player had the first kill in the round while playing the CT side. `FirstKillsCT` in SourceMod.
     */
    first_kills_ct: number;
    /**
     * The number of rounds where the player was the first to die in the round while playing the T side. `FirstDeathsT` in SourceMod.
     */
    first_deaths_t: number;
    /**
     * The number of rounds where the player was the first to die in the round while playing the CT side. `FirstDeathsCT` in SourceMod.
     */
    first_deaths_ct: number;
    /**
     * The number of times the player got a kill in a trade. `TradeKills` in SourceMod.
     */
    trade_kills: number;
    /**
     * The number of rounds where the player (k)illed a player, had an (a)ssist, (s)urvived or was (t)raded. `KAST` in SourceMod.
     */
    kast: number;
    /**
     * The in-game "score" of the player. `Score` in SourceMod.
     */
    score: number;
    /**
     * The number of times the player was elected the round MVP. `MVPs` in SourceMod.
     */
    mvp: number;
};

