/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5PlayerBase } from './Get5PlayerBase.js';
import type { Get5PlayerStats } from './Get5PlayerStats.js';

export type Get5StatsPlayer = (Get5PlayerBase & {
    stats: Get5PlayerStats;
});

