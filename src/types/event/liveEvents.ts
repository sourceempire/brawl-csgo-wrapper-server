import { Get5Event } from ".";

/**
 * Events that only occur during live rounds (not during knife, veto or warmup).
 */
 interface LiveEvent extends Get5Event {}