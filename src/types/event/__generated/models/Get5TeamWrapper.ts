/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Describes a team. `Team1` or `Team2` in SourceMod.
 */
export type Get5TeamWrapper = {
    /**
     * User-supplied ID of the team, if one was provided. `GetId()` and `SetId()` in SourceMod. `null` in JSON and an empty string in SourceMod.
     */
    id: string | null;
    /**
     * The name of the team. `GetName()` and `SetName()` in SourceMod.
     */
    name: string;
};

