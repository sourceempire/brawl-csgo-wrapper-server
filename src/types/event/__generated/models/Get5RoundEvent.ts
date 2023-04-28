/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MapEvent } from './Get5MapEvent.js';

export type Get5RoundEvent = (Get5MapEvent & {
    /**
     * The round number of the map, starting at 0. `RoundNumber` in SourceMod.
     */
    round_number: number;
});

