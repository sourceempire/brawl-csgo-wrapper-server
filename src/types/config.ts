import { SteamId } from "./common"

export type Get5PlayerSet = { [key: SteamId]: string } | [SteamId] 

export interface Get5MatchTeam {
    players: Get5PlayerSet 
    name: string 
    coaches?: Get5PlayerSet 
    tag?: string 
    flag?: string 
    logo?: string 
    series_score?: number 
    matchtext?: string 
}

export interface Get5MatchTeamFromFile {
    fromfile: string
}

export interface Get5Match {
    matchid: string 
    num_maps: number
    players_per_team: number
    maplist: string[] 
    team1: Get5MatchTeam | Get5MatchTeamFromFile 
    team2: Get5MatchTeam | Get5MatchTeamFromFile
    match_title?: string 
    clinch_series?: boolean 
    coaches_per_team?: number
    coaches_must_ready?: boolean
    min_players_to_ready?: number
    min_spectators_to_ready?: number
    skip_veto?: boolean
    veto_first?: 'team1' | 'team2' | 'random'
    side_type?: 'standard' | 'always_knife' | 'never_knife'
    map_sides?: ['team1_ct' | 'team1_t' | 'knife']
    spectators?: { 
        name?: string
        players?: Get5PlayerSet
    },
    favored_percentage_team1?: number
    favored_percentage_text?: string
    cvars?: { [key: string]: string | number } 
}


