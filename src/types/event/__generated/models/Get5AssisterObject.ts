/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Player } from './Get5Player.js';

/**
 * Describes an assist to a kill. `null` if no assister. `Assist`
 * in SourceMod.
 *
 */
export type Get5AssisterObject = {
    player: Get5Player;
    /**
     * Indicates if the assist was friendly fire. `FriendlyFire` in SourceMod.
     */
    friendly_fire: boolean;
    /**
     * Indicates if the assist was a flash assist. `FlashAssist` in SourceMod.
     */
    flash_assist: boolean;
};

