/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MapTeamEvent } from './Get5MapTeamEvent.js';
import type { Get5PauseType } from './Get5PauseType.js';

export type Get5MatchPauseEvent = (Get5MapTeamEvent & {
    pause_type: Get5PauseType;
});

