import { usePortal } from './store/PortalContext';
import { isSupabaseConfigured } from './lib/supabase';
import { TopBar } from './components/TopBar';
import { Login } from './components/auth/Login';
import { ConfigNeeded } from './components/auth/ConfigNeeded';
import { ClientLanding } from './components/client/ClientLanding';
import { PhaseScreen } from './components/client/PhaseScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminClientDetail } from './components/admin/AdminClientDetail';
import { OrbitMark } from './components/ui/Logo';

function Loading({ label = 'Loading your portal…' }: { label?: string }) {
  return (
    <div className="auth-wrap">
      <div style={{ textAlign: 'center', display: 'grid', gap: 14, justifyItems: 'center' }}>
        <div className="orbit-spin">
          <OrbitMark size={44} />
        </div>
        <div className="muted" style={{ fontSize: 14, fontWeight: 600 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function App() {
  const { state, session, role, authLoading, ready } = usePortal();

  // 1. No backend keys yet → setup screen
  if (!isSupabaseConfigured) return <ConfigNeeded />;

  // 2. Checking the session
  if (authLoading) return <Loading label="Signing you in…" />;

  // 3. Not signed in → magic-link login
  if (!session) return <Login />;

  // 4. Signed in, still provisioning role/data
  if (!role || !ready) return <Loading />;

  const isAdmin = role === 'admin';

  let viewKey: string;
  let view: React.ReactNode;
  if (isAdmin) {
    if (state.selectedClientId) {
      viewKey = 'admin-detail-' + state.selectedClientId;
      view = <AdminClientDetail />;
    } else {
      viewKey = 'admin-dash';
      view = <AdminDashboard />;
    }
  } else if (state.screen === 'phase') {
    viewKey = 'phase-' + state.activePhase;
    view = <PhaseScreen />;
  } else {
    viewKey = 'landing';
    view = <ClientLanding />;
  }

  return (
    <div className="app">
      <TopBar />
      <main className="main">
        <div className="container">
          <div key={viewKey} className="view-anim">
            {view}
          </div>
        </div>
      </main>
    </div>
  );
}
