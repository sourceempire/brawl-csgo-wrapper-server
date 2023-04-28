/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5PlayerTimedRoundEvent } from './Get5PlayerTimedRoundEvent.js';
import type { Get5Weapon } from './Get5Weapon.js';

export type Get5PlayerWeaponEvent = (Get5PlayerTimedRoundEvent & {
    weapon: Get5Weapon;
});

