import { SteamId } from '../types/common.js'
import { Get5_OnPlayerConnected } from '../types/event/get5Events.js'
import { haveSameValues } from '../utils.js';

type StartMatchTracker = {
    players: SteamId[];
    connectedPlayers: Set<SteamId>; // is a Set because a player might disconnect and connect again
}

const playerCountTrackers: Map<string, StartMatchTracker> = new Map()

export function addTracker(matchId: string, options: { players: SteamId[] }) {
    playerCountTrackers.set(matchId, { players: options.players, connectedPlayers: new Set() })
}

export function removeTracker(matchId: string) {
    playerCountTrackers.delete(matchId)
}

export function isMatchReadyToStart(matchId: string, event: Get5_OnPlayerConnected) {
    const tracker = playerCountTrackers.get(matchId);

    if (!tracker) {
        console.log('\x1b[33m Tracker was not found for matchId: ! \x1b[0m', matchId, 'in connectedPlayerCountHandler');
        return false
    }

    if (!tracker.players.includes(event.player.steamid)) {
        console.log('\x1b[33m Player is not in match with id: ! \x1b[0m', matchId, 'steamid:', event.player.steamid);
    }

    tracker.connectedPlayers.add(event.player.steamid);
    
    console.log('connectedPlayers', Array.from(tracker.connectedPlayers));
    console.log('players', tracker.players);

    return haveSameValues(Array.from(tracker.connectedPlayers), tracker.players)
}
