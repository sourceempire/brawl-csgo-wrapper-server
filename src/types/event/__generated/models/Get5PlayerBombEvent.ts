/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5PlayerTimedRoundEvent } from './Get5PlayerTimedRoundEvent.js';
import type { Get5Site } from './Get5Site.js';

export type Get5PlayerBombEvent = (Get5PlayerTimedRoundEvent & {
    site: Get5Site;
});

