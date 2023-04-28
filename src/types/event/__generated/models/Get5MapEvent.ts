/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MatchEvent } from './Get5MatchEvent.js';

export type Get5MapEvent = (Get5MatchEvent & {
    /**
     * The map number in the series, starting at 0. `MapNumber` in SourceMod.
     */
    map_number: number;
});

