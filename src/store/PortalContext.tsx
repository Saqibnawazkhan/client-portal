import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import type { ActivityItem, Client, Notification, PhaseNumber, PhaseState, Role } from '../types';
import { supabase } from '../lib/supabase';
import { currentPhaseOf, initialNav, navReducer, type Action } from './portalReducer';

interface DerivedState {
  role: Role;
  screen: 'landing' | 'phase';
  activePhase: PhaseNumber;
  activeClientId: string | null;
  selectedClientId: string | null;
  clients: Client[];
  activity: ActivityItem[];
  notifications: Notification[];
}

interface PortalContextValue {
  state: DerivedState;
  dispatch: (action: Action) => void;
  activeClient: Client;
  getClient: (id: string) => Client | undefined;
  currentPhaseOf: typeof currentPhaseOf;
  // auth
  session: Session | null;
  role: Role | null;
  authLoading: boolean;
  ready: boolean;
  signOut: () => Promise<void>;
}

const PortalContext = createContext<PortalContextValue | null>(null);

/** Shape raw client + phase rows into the Client objects the UI expects. */
function shapeClients(
  clientRows: Record<string, unknown>[],
  phaseRows: Record<string, unknown>[],
): Client[] {
  return clientRows.map((c) => {
    const phases = {} as Record<PhaseNumber, PhaseState>;
    for (let n = 1 as PhaseNumber; n <= 4; n = (n + 1) as PhaseNumber) {
      const row = phaseRows.find((p) => p.client_id === c.id && p.phase_number === n);
      phases[n] = {
        status: (row?.status as PhaseState['status']) ?? 'locked',
        data: (row?.data as PhaseState['data']) ?? {},
      };
    }
    return {
      id: c.id as string,
      company: (c.company as string) || (c.email as string) || 'New client',
      contact: (c.contact as string) || '',
      email: (c.email as string) || '',
      industry: (c.industry as string) || '—',
      service: (c.service as string) || '—',
      phases,
    };
  });
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [nav, navDispatch] = useReducer(navReducer, initialNav);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState<{
    clients: Client[];
    activity: ActivityItem[];
    notifications: Notification[];
  }>({ clients: [], activity: [], notifications: [] });
  const [dataReady, setDataReady] = useState(false);

  const roleRef = useRef<Role | null>(null);
  roleRef.current = role;

  // ---------- Load / refresh all data (respects RLS: client sees only their own) ----------
  const loadData = useCallback(async () => {
    if (!supabase) return;
    const [clientsRes, phasesRes, notifsRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: true }),
      supabase.from('phases').select('*'),
      supabase.from('notifications').select('*').eq('read', false),
    ]);
    const clients = shapeClients(clientsRes.data ?? [], phasesRes.data ?? []);

    let activity: ActivityItem[] = [];
    if (roleRef.current === 'admin') {
      const actRes = await supabase
        .from('activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      activity = (actRes.data ?? []).map((a) => ({
        id: a.id as string,
        t: a.text as string,
        kind: a.kind as ActivityItem['kind'],
        ago: timeAgo(a.created_at as string),
      }));
    }

    const notifications: Notification[] = (notifsRes.data ?? []).map((n) => ({
      id: n.id as string,
      clientId: n.client_id as string,
      phase: n.phase as PhaseNumber,
      read: n.read as boolean,
    }));

    setData({ clients, activity, notifications });
    setDataReady(true);
  }, []);

  // ---------- Fetch the signed-in user's role, with a short retry for fresh signups ----------
  const loadProfile = useCallback(async (uid: string) => {
    if (!supabase) return;
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).maybeSingle();
      if (profile?.role) {
        setRole(profile.role as Role);
        return;
      }
      await new Promise((r) => setTimeout(r, 500)); // trigger may still be provisioning
    }
    setRole('client');
  }, []);

  // ---------- Auth wiring ----------
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    let active = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!active) return;
      setSession(s);
      setAuthLoading(false);
      if (s) loadProfile(s.user.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setAuthLoading(false);
      if (s) {
        loadProfile(s.user.id);
      } else {
        setRole(null);
        setDataReady(false);
        setData({ clients: [], activity: [], notifications: [] });
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  // ---------- Load data + subscribe to realtime once we know the role ----------
  useEffect(() => {
    if (!supabase || !session || !role) return;
    const sb = supabase;
    loadData();

    const channel = sb
      .channel('portal-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'phases' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadData())
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, [session, role, loadData]);

  // ---------- Derived state ----------
  const clients = data.clients;
  const activeClientId = role === 'client' ? (clients[0]?.id ?? null) : (nav.selectedClientId ?? null);
  const activeClient =
    clients.find((c) => c.id === activeClientId) ?? clients[0] ?? PLACEHOLDER_CLIENT;

  const state: DerivedState = {
    role: (role ?? 'client') as Role,
    screen: nav.screen,
    activePhase: nav.activePhase,
    activeClientId,
    selectedClientId: nav.selectedClientId,
    clients,
    activity: data.activity,
    notifications: data.notifications,
  };

  // ---------- Dispatch: nav locally, writes through RPC ----------
  const dispatch = useCallback(
    (action: Action) => {
      switch (action.type) {
        case 'HOME':
        case 'OPEN_PHASE':
        case 'BACK_TO_LANDING':
        case 'SELECT_CLIENT':
        case 'ADMIN_BACK':
          navDispatch(action);
          if (action.type === 'OPEN_PHASE' || action.type === 'SELECT_CLIENT')
            window.scrollTo({ top: 0, behavior: 'smooth' });
          break;

        case 'SUBMIT_PHASE':
          (async () => {
            if (!supabase) return;
            const { error } = await supabase.rpc('submit_phase', {
              p_phase: nav.activePhase,
              p_data: action.data,
            });
            if (error) {
              alert('Sorry — we couldn’t submit that. ' + error.message);
              return;
            }
            navDispatch({ type: 'BACK_TO_LANDING' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadData();
          })();
          break;

        case 'APPROVE':
          (async () => {
            if (!supabase) return;
            const { error } = await supabase.rpc('approve_phase', { p_client_id: action.id, p_phase: action.n });
            if (error) alert('Could not approve: ' + error.message);
            else loadData();
          })();
          break;

        case 'TOGGLE_LOCK':
          (async () => {
            if (!supabase) return;
            const { error } = await supabase.rpc('toggle_lock', { p_client_id: action.id, p_phase: action.n });
            if (error) alert('Could not update: ' + error.message);
            else loadData();
          })();
          break;

        case 'DISMISS_BANNER':
          (async () => {
            if (!supabase) return;
            await supabase.rpc('mark_notifications_read');
            loadData();
          })();
          break;

        case 'BANNER_VIEW':
          (async () => {
            if (!supabase) return;
            const phase = currentPhaseOf(activeClient);
            await supabase.rpc('mark_notifications_read');
            navDispatch({ type: 'BANNER_VIEW', phase });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadData();
          })();
          break;
      }
    },
    [nav.activePhase, activeClient, loadData],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    navDispatch({ type: 'HOME' });
  }, []);

  const getClient = (id: string) => clients.find((c) => c.id === id);
  const ready = !authLoading && (!session || !role || dataReady);

  return (
    <PortalContext.Provider
      value={{
        state,
        dispatch,
        activeClient,
        getClient,
        currentPhaseOf,
        session,
        role,
        authLoading,
        ready,
        signOut,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}

// A never-rendered fallback so `activeClient` is always defined for TS.
const PLACEHOLDER_CLIENT: Client = {
  id: '',
  company: '',
  contact: '',
  email: '',
  industry: '',
  service: '',
  phases: {
    1: { status: 'open', data: {} },
    2: { status: 'locked', data: {} },
    3: { status: 'locked', data: {} },
    4: { status: 'locked', data: {} },
  },
};

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}
