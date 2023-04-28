/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Describes a weapon. `Weapon` in SourceMod.
 */
export type Get5Weapon = {
    /**
     * The in-game console name of the weapon used. `GetName()` and `SetName()` in SourceMod.
     */
    name: string;
    /**
     * The weapon ID used. See https://sm.alliedmods.net/new-api/cstrike/CSWeaponID `Id` in SourceMod. Some weapons are ID 0, such as the C4 bomb explosion or molotov/incendiary fire.
     */
    id: number;
};

