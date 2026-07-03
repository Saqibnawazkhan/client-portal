import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { Client, PortalState } from '../types';
import { seed } from '../data/seed';
import { reducer, currentPhaseOf, type Action } from './portalReducer';

const KEY = 'orbit_portal_react_v2';

interface PortalContextValue {
  state: PortalState;
  dispatch: Dispatch<Action>;
  activeClient: Client;
  getClient: (id: string) => Client | undefined;
  currentPhaseOf: typeof currentPhaseOf;
}

const PortalContext = createContext<PortalContextValue | null>(null);

function init(): PortalState {
  let base: PortalState | null = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) base = JSON.parse(raw) as PortalState;
  } catch {
    /* ignore */
  }
  const state = base ?? seed('client');

  // Deep-link support: ?role=admin|client and ?phase=1..4 open straight into a view.
  try {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    const phase = Number(params.get('phase'));
    const clientId = params.get('client');
    let next = state;
    if (role === 'admin' || role === 'client') {
      next = { ...next, role, selectedClientId: null };
    }
    if (clientId && state.clients.some((c) => c.id === clientId)) {
      next = { ...next, role: 'admin', selectedClientId: clientId };
    } else if (phase >= 1 && phase <= 4) {
      next = { ...next, role: 'client', screen: 'phase', activePhase: phase as PortalState['activePhase'] };
    } else if (next !== state) {
      next = { ...next, screen: 'landing' };
    }
    return next;
  } catch {
    /* ignore */
  }
  return state;
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const getClient = (id: string) => state.clients.find((c) => c.id === id);
  const activeClient = getClient(state.activeClientId) ?? state.clients[0];

  return (
    <PortalContext.Provider value={{ state, dispatch, activeClient, getClient, currentPhaseOf }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}

export function resetState(): PortalState {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return seed('client');
}
