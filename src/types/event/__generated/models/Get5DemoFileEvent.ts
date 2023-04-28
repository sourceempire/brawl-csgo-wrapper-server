/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5MapEvent } from './Get5MapEvent.js';

export type Get5DemoFileEvent = (Get5MapEvent & {
    /**
     * The name of the file containing the GOTV recording of the map. The format is determined by the
     * `get5_demo_name_format` parameter.
     *
     */
    filename: string;
});

