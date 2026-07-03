import type { Client, PhaseNumber, PortalState } from '../types';
import { phaseMeta } from '../data/phases';

export function currentPhaseOf(c: Client): PhaseNumber {
  let cur: PhaseNumber = 1;
  for (let n = 1 as PhaseNumber; n <= 4; n = (n + 1) as PhaseNumber) {
    if (c.phases[n].status !== 'locked') cur = n;
  }
  return cur;
}

export type Action =
  | { type: 'SET_ROLE'; role: 'client' | 'admin' }
  | { type: 'HOME' }
  | { type: 'RESET'; state: PortalState }
  | { type: 'OPEN_PHASE'; n: PhaseNumber }
  | { type: 'BACK_TO_LANDING' }
  | { type: 'SUBMIT_PHASE'; data: Record<string, string | string[]> }
  | { type: 'SELECT_CLIENT'; id: string }
  | { type: 'ADMIN_BACK' }
  | { type: 'APPROVE'; id: string; n: PhaseNumber; notify: boolean }
  | { type: 'TOGGLE_LOCK'; id: string; n: PhaseNumber }
  | { type: 'DISMISS_BANNER' }
  | { type: 'BANNER_VIEW' };

const uid = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function reducer(state: PortalState, action: Action): PortalState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role, screen: 'landing', selectedClientId: null };

    case 'HOME':
      return { ...state, selectedClientId: null, screen: 'landing' };

    case 'RESET':
      return action.state;

    case 'OPEN_PHASE':
      return { ...state, activePhase: action.n, screen: 'phase' };

    case 'BACK_TO_LANDING':
      return { ...state, screen: 'landing' };

    case 'SUBMIT_PHASE': {
      const n = state.activePhase;
      const clients = state.clients.map((c) => {
        if (c.id !== state.activeClientId) return c;
        return { ...c, phases: { ...c.phases, [n]: { status: 'submitted' as const, data: action.data } } };
      });
      return { ...state, clients, screen: 'landing' };
    }

    case 'SELECT_CLIENT':
      return { ...state, selectedClientId: action.id };

    case 'ADMIN_BACK':
      return { ...state, selectedClientId: null };

    case 'APPROVE': {
      const { id, n } = action;
      const client = state.clients.find((c) => c.id === id);
      const clients = state.clients.map((cc) => {
        if (cc.id !== id) return cc;
        const phases = { ...cc.phases };
        phases[n] = { ...phases[n], status: 'approved' };
        if (n < 4) phases[(n + 1) as PhaseNumber] = { ...phases[(n + 1) as PhaseNumber], status: 'open' };
        return { ...cc, phases };
      });
      const activity = [
        {
          id: uid('act'),
          t: `You approved ${client?.company} Phase ${n} — ${phaseMeta(n).short}`,
          kind: 'approve' as const,
          ago: 'Just now',
        },
        ...state.activity,
      ];
      const notifications = [...state.notifications];
      if (n < 4 && action.notify) {
        notifications.push({ id: uid('n'), clientId: id, phase: (n + 1) as PhaseNumber, read: false });
      }
      return { ...state, clients, activity, notifications };
    }

    case 'TOGGLE_LOCK': {
      const { id, n } = action;
      const clients = state.clients.map((cc) => {
        if (cc.id !== id) return cc;
        const phases = { ...cc.phases };
        const st = phases[n].status;
        if (st === 'locked') phases[n] = { ...phases[n], status: 'open' };
        else if (st === 'open') phases[n] = { ...phases[n], status: 'locked' };
        else return cc;
        return { ...cc, phases };
      });
      return { ...state, clients };
    }

    case 'DISMISS_BANNER': {
      const notifications = state.notifications.map((nt) =>
        nt.clientId === state.activeClientId ? { ...nt, read: true } : nt,
      );
      return { ...state, notifications };
    }

    case 'BANNER_VIEW': {
      const client = state.clients.find((c) => c.id === state.activeClientId)!;
      const cur = currentPhaseOf(client);
      const notifications = state.notifications.map((nt) =>
        nt.clientId === state.activeClientId ? { ...nt, read: true } : nt,
      );
      return { ...state, notifications, activePhase: cur, screen: 'phase' };
    }

    default:
      return state;
  }
}
