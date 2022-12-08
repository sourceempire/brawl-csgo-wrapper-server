import { MatchId, SeriesType, SteamId, TeamId } from "./common.js"
import { Team } from "./event/index.js"

enum MapKey {
    First = "map0",
    Second = "map1",
    Third = "map2",
    Fourth = "map3",
    Fifth = "map4",
}

export type PlayerStatsRaw = {
  "1kill_rounds": number,
  "2kill_rounds": number,
  "3kill_rounds": number,
  "4kill_rounds": number,
  "5kill_rounds": number,
  assists: number,
  bomb_defuses: number,
  bomb_plants: number,
  coaching: 0 | 1,
  contribution_score: number, // stat for planting bombs, defusing etc, not sure how it is calculated
  damage: number,
  deaths: number,
  enemies_flashed: number,
  firstdeath_ct: number,
  firstdeath_t: number,
  firstkill_ct: number,
  firstkill_t: number,
  flashbang_assists: number,
  friendlies_flashed: number,
  headshot_kills: number,
  // init: number, // used to zero-fill stats only. Not a real stat.
  kast: number, // percentage of rounds in which the player either had a kill, assist, survived or was traded
  mvp: number,
  name: string,
  kills: number,
  knife_kills: number,
  roundsplayed: number,
  suicides: number,
  teamkills: number,
  tradekill: number, // A trade kill or a "refrag" means killing on opponent right after they kill your teammate
  util_damage: number, // Damage from grenades?
  v1: number, // Number of 1v1 scenarios
  v2: number, // Number of 1v2 scenarios
  v3: number, // Number of 1v3 scenarios
  v4: number, // Number of 1v4 scenarios
  v5: number, // Number of 1v5 scenarios
}

export type TeamInfoRaw = {
  score: number,
} & {
  [playerId: SteamId]: PlayerStatsRaw,
}

export type SeriesStatsRaw = {
  series_type: SeriesType
  team1_name: string
  team2_name: string
  winner?: Team
  [MapKey.First]?: MapStatsRaw
  [MapKey.Second]?: MapStatsRaw
  [MapKey.Third]?: MapStatsRaw
  [MapKey.Fourth]?: MapStatsRaw
  [MapKey.Fifth]?: MapStatsRaw
} 

export type MapStatsRaw = {
  winner?: Team,
  mapname: string,
  [Team.TEAM1]: TeamInfoRaw
  [Team.TEAM2]: TeamInfoRaw
  
}

export type PlayerStats = {
  assists: number,
  bombDefuses: number,
  bombPlants: number,
  deaths: number,
  headshotKills: number,
  kills: number,
  mvp: number,
  teamKills: number,
}

export type TeamInfo = {
  score: number,
  players: {
    [steamId: SteamId]: PlayerStats
  }
}

export type MapStats = {
  winner: TeamId | null, 
  mapName: string,
  teams: { [teamId: string]: TeamInfo }
}

export type SeriesStats = {
  matchId: MatchId,
  winner: TeamId | null,
  maps: MapStats[]
}