/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Describes a pause type. `PauseType` in SourceMod and represented as an integer enum where 0 means no
 * pause. The `backup` pause is a special pause type fired when the game is paused due to a round backup restore.
 *
 */
export enum Get5PauseType {
    TACTICAL = 'tactical',
    TECHNICAL = 'technical',
    ADMIN = 'admin',
    BACKUP = 'backup',
}
