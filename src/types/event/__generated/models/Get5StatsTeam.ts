/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Get5Side } from './Get5Side.js';
import type { Get5StatsPlayer } from './Get5StatsPlayer.js';
import type { Get5TeamWrapper } from './Get5TeamWrapper.js';

/**
 * Describes a team with its score and player stats. `Team1` or `Team2` in SourceMod.
 */
export type Get5StatsTeam = (Get5TeamWrapper & {
    /**
     * The team's current series score, i.e. the number of maps they have won in the series. `SeriesScore` in SourceMod.
     */
    series_score: number;
    /**
     * The team's total score on the current map. `Score` in SourceMod.
     */
    score: number;
    /**
     * The team's score on the CT side on the current map. `ScoreCT` in SourceMod.
     */
    score_ct: number;
    /**
     * The team's score on the T side on the current map. `ScoreT` in SourceMod.
     */
    score_t: number;
    /**
     * The players on the team. `Players` in SourceMod.
     */
    players: Array<Get5StatsPlayer>;
    /**
     * The current side of the team. `Side` in SourceMod.
     */
    side: Get5Side;
    /**
     * The starting side of the team. `StartingSide` in SourceMod.
     */
    starting_side: Get5Side;
});

