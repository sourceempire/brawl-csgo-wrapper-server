import { Get5Event, Player, Get5EventName, MapNumber, RoundNumber, RoundTime, SayCommand } from ".";

/**
 * Events that occur based on players' chat or connection activity.
 */
interface ClientActionEvent extends Get5Event {
    player: Player
}

/**
 * Fired when a player connects to the server.
 */
export interface PlayerConnectedEvent extends ClientActionEvent {
    event: Get5EventName.PLAYER_CONNECTED
    ip_address: string
}

/**
 * Fired when a player disconnects from the server.
 */
export interface PlayerDisconnectedEvent extends ClientActionEvent {
    event: Get5EventName.PLAYER_DISCONNECTED
}

/**
 * Fired when a player types in chat.
 */
export interface PlayerSayEvent extends ClientActionEvent {
    event: Get5EventName.PLAYER_SAY
    map_number: MapNumber
    round_number: RoundNumber
    round_time: RoundTime
    command: SayCommand
    message: string
}
 