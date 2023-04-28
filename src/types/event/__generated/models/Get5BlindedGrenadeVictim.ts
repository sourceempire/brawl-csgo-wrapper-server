/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5GrenadeVictim } from './Get5GrenadeVictim.js';

export type Get5BlindedGrenadeVictim = (Get5GrenadeVictim & {
    /**
     * The duration in seconds the victim (`player`) was blinded by the grenade. `BlindDuration` in SourceMod.
     */
    blind_duration: number;
});

