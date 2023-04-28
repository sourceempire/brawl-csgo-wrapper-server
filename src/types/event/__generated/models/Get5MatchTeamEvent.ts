/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MatchEvent } from './Get5MatchEvent.js';
import type { Get5Team } from './Get5Team.js';

export type Get5MatchTeamEvent = (Get5MatchEvent & {
    team: Get5Team;
});

