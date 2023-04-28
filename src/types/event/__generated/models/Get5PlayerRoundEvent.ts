/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Player } from './Get5Player.js';
import type { Get5RoundEvent } from './Get5RoundEvent.js';

export type Get5PlayerRoundEvent = (Get5RoundEvent & {
    player: Get5Player;
});

