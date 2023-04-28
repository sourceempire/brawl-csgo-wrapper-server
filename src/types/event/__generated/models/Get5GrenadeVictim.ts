/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Player } from './Get5Player.js';

export type Get5GrenadeVictim = {
    player: Get5Player;
    /**
     * Indicates if the grenade victim (`player`) was a friendly. `FriendlyFire` in SourceMod.
     */
    friendly_fire: boolean;
};

