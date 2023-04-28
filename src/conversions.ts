import { getTeamId } from './csgoServerHandler.js'
import { MatchId } from './types/common.js'
import { RoundEndEvent, roundEndResonMap, Team } from './types/event/index.js'
import { 
    MapStats,
    MapStatsRaw,
    PlayerStats,
    PlayerStatsRaw,
    SeriesStats,
    SeriesStatsRaw,
    TeamInfo,
    TeamInfoRaw
} from './types/matchStats.js'

const convertSeriesStats = (matchId: MatchId, seriesStatsRaw: SeriesStatsRaw): SeriesStats => {
  const maps: MapStatsRaw[] = []

  if (seriesStatsRaw.map0) {
    maps.push(seriesStatsRaw.map0)
  }
  if (seriesStatsRaw.map1) {
    maps.push(seriesStatsRaw.map1)
  }
  if (seriesStatsRaw.map2) {
    maps.push(seriesStatsRaw.map2)
  }
  if (seriesStatsRaw.map3) {
    maps.push(seriesStatsRaw.map3)
  }
  if (seriesStatsRaw.map4) {
    maps.push(seriesStatsRaw.map4)
  }

  let winner: string | null = null;
  if (seriesStatsRaw.winner) {
    winner = getTeamId(matchId, seriesStatsRaw.winner)
  }

  return {
    matchId,
    winner,
    maps: maps.map((mapRaw) => convertMapStats(matchId, mapRaw))
  }
}
  
const convertMapStats = (matchId: MatchId, mapStatsRaw: MapStatsRaw): MapStats => {
  const team1Id = getTeamId(matchId, Team.TEAM1)
  const team2Id = getTeamId(matchId, Team.TEAM2)

  const {mapname, team1, team2} = mapStatsRaw

  let winner: string | null = null;
  if (mapStatsRaw.winner) {
    winner = getTeamId(matchId, mapStatsRaw.winner)
  }

  return {
    winner,
    mapName: mapname,
    teams: {
      [team1Id]: convertTeamInfo(team1),
      [team2Id]: convertTeamInfo(team2)
    }
  }
}
  
const convertTeamInfo = (teamInfoRaw: TeamInfoRaw): TeamInfo => {
  const {score} = teamInfoRaw;

  const steamIds = Object.keys(teamInfoRaw).filter((key) => key !== 'score');  

  return {

    score,
    players: steamIds.reduce((acc, steamId) => {
      const playerInfoRaw = teamInfoRaw[steamId];
      acc[steamId] = convertPlayerStats(playerInfoRaw)
      return acc;
    }, {})
  }
}
  
const convertPlayerStats = (playerStatsRaw: PlayerStatsRaw): PlayerStats => {
  const {
    assists,
    bomb_defuses,
    bomb_plants,
    deaths,
    headshot_kills,
    kills,
    mvp,
    teamkills
  } = playerStatsRaw;
  
  return {
    assists: assists,
    bombDefuses: bomb_defuses,
    bombPlants: bomb_plants,
    deaths: deaths,
    headshotKills: headshot_kills,
    kills: kills,
    mvp: mvp,
    teamKills: teamkills,
  }
}

const convertRoundEndEvent = (roundEndEvent: RoundEndEvent) => {
  const team1Id = getTeamId(roundEndEvent.matchid, Team.TEAM1);
  const team2Id = getTeamId(roundEndEvent.matchid, Team.TEAM2);
  const roundWinner = getTeamId(roundEndEvent.matchid, roundEndEvent.winner.team);


  return {
    matchId: roundEndEvent.matchid,
    event: roundEndEvent.event,
    roundNumber: roundEndEvent.round_number,
    roundTime: roundEndEvent.round_time,
    mapNumber: roundEndEvent.map_number,
    reason: roundEndResonMap[roundEndEvent.reason],
    winner: {
      teamId: roundWinner,
      side: roundEndEvent.winner.side,
    },
    score: {
      [team1Id]: roundEndEvent.team1_score,
      [team2Id]: roundEndEvent.team2_score,
    }
  }
}

export const statConversion = {
    seriesStats: convertSeriesStats,
    mapStats: convertMapStats,
    teamInfo: convertTeamInfo,
    playerStats: convertPlayerStats,
    roundEndEvent: convertRoundEndEvent,
}