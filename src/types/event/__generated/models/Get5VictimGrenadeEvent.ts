/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5BlindedGrenadeVictim } from './Get5BlindedGrenadeVictim.js';
import type { Get5DamageGrenadeVictim } from './Get5DamageGrenadeVictim.js';
import type { Get5PlayerWeaponEvent } from './Get5PlayerWeaponEvent.js';

export type Get5VictimGrenadeEvent = (Get5PlayerWeaponEvent & {
    /**
     * Describes the victims of the grenade. For flash bangs, these are `Get5BlindedGrenadeVictim` and for molotovs/firebombs and HE, these are `Get5DamageGrenadeVictim`. The array is empty if the grenade did not affect anyone. `Victims` in SourceMod.
     */
    victims: Array<(Get5BlindedGrenadeVictim | Get5DamageGrenadeVictim)>;
});

