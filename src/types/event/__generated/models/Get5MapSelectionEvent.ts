/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MatchTeamEvent } from './Get5MatchTeamEvent.js';

export type Get5MapSelectionEvent = (Get5MatchTeamEvent & {
    /**
     * The name of the map related to the event (map picked/banned etc.). `GetMapName()` and `SetMapName()` in SourceMod.
     */
    map_name: string;
});

