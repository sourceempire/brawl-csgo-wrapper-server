/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Player } from './Get5Player.js';
import type { Get5TimedRoundEvent } from './Get5TimedRoundEvent.js';

export type Get5PlayerTimedRoundEvent = (Get5TimedRoundEvent & {
    player: Get5Player;
});

