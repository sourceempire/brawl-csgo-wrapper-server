/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5VictimGrenadeEvent } from './Get5VictimGrenadeEvent.js';

export type Get5VictimWithDamageGrenadeEvent = (Get5VictimGrenadeEvent & {
    /**
     * The total damage the grenade did to enemies. `DamageEnemies` in SourceMod.
     */
    damage_enemies: number;
    /**
     * The total damage the grenade did to friendlies. `DamageFriendlies` in SourceMod.
     */
    damage_friendlies: number;
});

