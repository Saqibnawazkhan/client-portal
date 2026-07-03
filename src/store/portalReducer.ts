import type { Client, PhaseNumber } from '../types';

/** The furthest phase that isn't locked = the client's current phase. */
export function currentPhaseOf(c: Client): PhaseNumber {
  let cur: PhaseNumber = 1;
  for (let n = 1 as PhaseNumber; n <= 4; n = (n + 1) as PhaseNumber) {
    if (c.phases[n].status !== 'locked') cur = n;
  }
  return cur;
}

/** Local UI navigation state (not persisted to the DB). */
export interface NavState {
  screen: 'landing' | 'phase';
  activePhase: PhaseNumber;
  selectedClientId: string | null;
}

export const initialNav: NavState = { screen: 'landing', activePhase: 1, selectedClientId: null };

/** Actions dispatched by components. Some are local navigation, some are DB writes. */
export type Action =
  | { type: 'HOME' }
  | { type: 'OPEN_PHASE'; n: PhaseNumber }
  | { type: 'BACK_TO_LANDING' }
  | { type: 'SELECT_CLIENT'; id: string }
  | { type: 'ADMIN_BACK' }
  | { type: 'SUBMIT_PHASE'; data: Record<string, string | string[]> }
  | { type: 'APPROVE'; id: string; n: PhaseNumber; notify?: boolean }
  | { type: 'TOGGLE_LOCK'; id: string; n: PhaseNumber }
  | { type: 'DISMISS_BANNER' }
  | { type: 'BANNER_VIEW'; phase?: PhaseNumber };

/** Handles only the local navigation actions; DB actions are handled in the provider. */
export function navReducer(state: NavState, action: Action): NavState {
  switch (action.type) {
    case 'HOME':
      return { ...state, screen: 'landing', selectedClientId: null };
    case 'OPEN_PHASE':
      return { ...state, screen: 'phase', activePhase: action.n };
    case 'BACK_TO_LANDING':
      return { ...state, screen: 'landing' };
    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.id };
    case 'ADMIN_BACK':
      return { ...state, selectedClientId: null };
    case 'BANNER_VIEW':
      return { ...state, screen: 'phase', activePhase: action.phase ?? state.activePhase };
    default:
      return state;
  }
}
