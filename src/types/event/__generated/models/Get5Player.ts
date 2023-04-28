/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5PlayerBase } from './Get5PlayerBase.js';
import type { Get5Side } from './Get5Side.js';

export type Get5Player = (Get5PlayerBase & {
    /**
     * The in-game user ID of the player. This uniquely identifies the player within a server and is
     * auto-incremented for each connecting player. 0 for Console but >0 for all players, bots or GOTV. If the same
     * player reconnects, they will be given a new ID. `steamid` uniquely identifies the player outside the server.
     *
     */
    user_id: number;
    side: Get5Side;
    /**
     * Indicates if the player is a bot. `IsBot` in SourceMod.
     */
    is_bot: boolean;
});

