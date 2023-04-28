/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MatchEvent } from './Get5MatchEvent.js';
import type { Get5Player } from './Get5Player.js';

export type Get5PlayerDisconnectedEvent = (Get5MatchEvent & {
    player: Get5Player;
});

