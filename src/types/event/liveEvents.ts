import { Assist, BombSite, Get5Event, Get5EventName, MapNumber, Player, RoundNumber, RoundTime, Victim, Weapon, Winner } from '.';

/**
 * Events that only occur during live rounds (not during knife, veto or warmup).
 */
 type LiveEvent = Get5Event

/**
 * Fired when a round starts (when freezetime begins).
 */
export interface RoundStartEvent extends LiveEvent {
    event: Get5EventName.ROUND_START
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
}

/**
 * Fired when a round ends - when the result is in; not when the round stops. 
 * Game activity can occur after this.
 */
export interface RoundEndEvent extends LiveEvent {
    event: Get5EventName.ROUND_END
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    reason: number // See RoundEndReason enum
    winner: Winner
    team1_score: number
    team2_score: number
}

/**
 * Fired after the stats update on round end.
 */
export interface RoundStatsUpdatedEvent extends LiveEvent {
    event: Get5EventName.STATS_UPDATED
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
}

/**
 * Fired when a player is elected the MVP of the round.
 */
export interface PlayerBecameMVPEvnet extends LiveEvent {
    event: Get5EventName.ROUND_MVP
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    player: Player
    reason: unknown // TODO -> Determine what this reason can be and what it means
}

/**
 * Fired whenever a grenade is thrown by a player. The weapon property reflects the grenade used.
 */
export interface GrenadeThrown extends LiveEvent {
    event: Get5EventName.GRENADE_THROWN
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    player: Player
    weapon: Weapon
}

/**
 * Fired when a player dies.
 */
export interface PlayerDeathEvent extends LiveEvent {
    event: Get5EventName.PLAYER_DEATH,
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    player: Player
    weapon: Weapon
    bomb: boolean
    headshot: boolean
    thru_smoke: boolean
    penetrated: boolean
    attacker_blind: boolean
    no_scope: boolean
    suicide: boolean
    friendly_fire: boolean
    attacker: Player | null
    assist: Assist | null
}

interface GrenadeDetonatedEvent extends LiveEvent {
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    player: Player
    weapon: Weapon
}

interface DamagingGrenadeDetonationEvent extends GrenadeDetonatedEvent {
    damage_enemies: number
    damage_friendlies: number
}

/**
 * Fired when an HE grenade detonates. player describes who threw the HE and victims who 
 * were affected. weapon is always an HE grenade.
 */
export interface HEGrenadeDetonatedEvent extends DamagingGrenadeDetonationEvent {
    event: Get5EventName.HEGRENADE_DETONATED
    victims: Victim[]
}

/**
 * Fired when a molotov grenade expires. player describes who threw the molotov and victims 
 * who were affected. weapon is always a molotov grenade. Note that round_time reflects the 
 * time at which the grenade detonated (started burning).
 */
export interface MolotovDetonated extends DamagingGrenadeDetonationEvent {
    event: Get5EventName.MOLOTOV_DETONATED
    victims: Victim[]
}

/**
 * Fired when a flash bang grenade detonates. player describes who threw the flash bang and 
 * victims who were affected. weapon is always a flash bang grenade.
 */
export interface FlashBangDetonated extends GrenadeDetonatedEvent {
    event: Get5EventName.FLASHBANG_DETONATED
    victims: Victim[]
}

/**
 * Fired when an smoke grenade expires. player describes who threw the grenade. weapon is 
 * always a smoke grenade.
 */
export interface SmokeGrenadeDetonated extends GrenadeDetonatedEvent {
    event: Get5EventName.SMOKEGRENADE_DETONATED
    extinguished_molotov: true
}

/**
 * Fired when a decoy starts making noise. player describes who threw the grenade. weapon is 
 * always a decoy grenade.
 */
export interface DecoyStartedEvent extends GrenadeDetonatedEvent {
    event: Get5EventName.DECOYGRENADE_STARTED
}

interface BombEvent extends LiveEvent {
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    site: BombSite
}

/**
 * Fired when the bomb is planted. player describes who planted the bomb.
 */
export interface BombPlantedEvent extends BombEvent {
    event: Get5EventName.BOMB_PLANTED
    player: Player
}

/**
 * Fired when the bomb is defused. player describes who defused the bomb.
 */
export interface BombDefusedEvent extends BombEvent {
    event: Get5EventName.BOMB_DEFUSED
    player: Player
    bomb_time_remaining:  number
}

/**
 * Fired when the bomb explodes.
 */
export interface BombExplodedEvent extends BombEvent {
    event: Get5EventName.BOMB_EXPLODED
}
