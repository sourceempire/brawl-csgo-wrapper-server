/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Side } from './Get5Side.js';
import type { Get5Team } from './Get5Team.js';

/**
 * Describes a winning team (their side and team number). `Winner` in SourceMod.
 */
export type Get5Winner = {
    side: Get5Side;
    team: Get5Team;
};

