/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Event } from './Get5Event.js';

export type Get5MatchEvent = (Get5Event & {
    /**
     * The ID of the match. `GetMatchId()` and `SetMatchId()` in SourceMod.
     */
    matchid: string;
});

