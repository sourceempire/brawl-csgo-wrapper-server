import { Assist, BombSite, Get5Event, LiveEventName, MapNumber, Player, RoundNumber, RoundTime, Victim, Weapon, Winner } from ".";

/**
 * Events that only occur during live rounds (not during knife, veto or warmup).
 */
 interface LiveEvent extends Get5Event {}

/**
 * Fired when a round starts (when freezetime begins).
 */
export interface RoundStartEvent extends LiveEvent {
    event: LiveEventName.ROUND_START
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
}

/**
 * Fired when a round ends - when the result is in; not when the round stops. 
 * Game activity can occur after this.
 */
export interface RoundEndEvent extends LiveEvent {
    event: LiveEventName.ROUND_END
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    reason: unknown // TODO -> create enum from https://sourcemod.dev/#/cstrike/enumeration.CSRoundEndReason and check what is actually appearing here
    winner: Winner
    team1_score: number
    team2_score: number
}

/**
 * Fired after the stats update on round end.
 */
export interface RoundStatsUpdated extends LiveEvent {
    event: LiveEventName.STATS_UPDATED
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
}

/**
 * Fired when a player is elected the MVP of the round.
 */
export interface PlayerBecameMVPEvnet extends LiveEvent {
    event: LiveEventName.ROUND_MVP
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
    event: LiveEventName.GRENADE_THROWN
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
    event: LiveEventName.PLAYER_DEATH,
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

export interface HEGrenadeDetonatedEvent extends DamagingGrenadeDetonationEvent {
    event: LiveEventName.HEGRENADE_DETONATED
    victims: Victim[]
}

export interface MolotovDetonated extends DamagingGrenadeDetonationEvent {
    event: LiveEventName.MOLOTOV_DETONATED
    victims: Victim[]
}

export interface FlashBangDetonated extends GrenadeDetonatedEvent {
    event: LiveEventName.FLASHBANG_DETONATED
    victims: Victim[]
}

export interface SmokeGrenadeDetonated extends GrenadeDetonatedEvent {
    event: LiveEventName.SMOKEGRENADE_DETONATED
    extinguished_molotov: true
}

export interface DecoyStartedEvent extends GrenadeDetonatedEvent {
    event: LiveEventName.DECOYGRENADE_STARTED
}

interface BombEvent extends LiveEvent {
    matchid: string
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    site: BombSite
}

export interface BombPlantedEvent extends BombEvent {
    event: LiveEventName.BOMB_PLANTED
    player: Player
}

export interface BombDefusedEvent extends BombEvent {
    event: LiveEventName.BOMB_DEFUSED
    player: Player
    bomb_time_remaining:  number
}

export interface BombExplodedTime extends BombEvent {
    event: LiveEventName.BOMB_EXPLODED
}