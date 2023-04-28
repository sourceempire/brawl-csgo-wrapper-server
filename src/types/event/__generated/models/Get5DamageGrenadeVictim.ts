/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5GrenadeVictim } from './Get5GrenadeVictim.js';

export type Get5DamageGrenadeVictim = (Get5GrenadeVictim & {
    /**
     * The damage afflicted to the player by the grenade. `Damage` in SourceMod.
     */
    damage: number;
    /**
     * Indicates if the grenade victim (`player`) was killed by the grenade. `Killed` in SourceMod.
     */
    killed: boolean;
});

