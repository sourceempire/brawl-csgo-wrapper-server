/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5RoundEvent } from './Get5RoundEvent.js';

export type Get5TimedRoundEvent = (Get5RoundEvent & {
    /**
     * The number of milliseconds into the round the event occurred. `RoundTime` in SourceMod.
     */
    round_time: number;
});

