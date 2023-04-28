/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Get5PlayerBase = {
    /**
     * The SteamID64 of the player. `GetSteamId()` and `SetSteamId()`
     * in SourceMod. This will be `BOT-%d` if the player is a bot, where `%d` is the user ID (`user_id`).
     * The string will be empty for Console and GOTV.
     *
     */
    steamid: string;
    /**
     * The in-game name of the player. If the player is a bot, this will be "BOT Gary" etc. If console, this value
     * is `Console` and if GOTV, this value is `GOTV`. `GetName()` and `SetName()` in SourceMod.
     *
     */
    name: string;
};

