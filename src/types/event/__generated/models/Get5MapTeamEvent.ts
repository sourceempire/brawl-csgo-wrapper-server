/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MapEvent } from './Get5MapEvent.js';
import type { Get5Team } from './Get5Team.js';

export type Get5MapTeamEvent = (Get5MapEvent & {
    team: Get5Team;
});

