/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Represents the state of a Get5 match.
 *
 */
export enum Get5State {
    NONE = 'none',
    PRE_VETO = 'pre_veto',
    VETO = 'veto',
    WARMUP = 'warmup',
    KNIFE = 'knife',
    WAITING_FOR_KNIFE_DECISION = 'waiting_for_knife_decision',
    GOING_LIVE = 'going_live',
    LIVE = 'live',
    POST_GAME = 'post_game',
}
