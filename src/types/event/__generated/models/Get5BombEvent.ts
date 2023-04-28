/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Site } from './Get5Site.js';
import type { Get5TimedRoundEvent } from './Get5TimedRoundEvent.js';

export type Get5BombEvent = (Get5TimedRoundEvent & {
    site: Get5Site;
});

