import type { ReactNode } from 'react';
import { usePortal } from './store/PortalContext';
import { TopBar } from './components/TopBar';
import { ClientLanding } from './components/client/ClientLanding';
import { PhaseScreen } from './components/client/PhaseScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminClientDetail } from './components/admin/AdminClientDetail';

export function App() {
  const { state } = usePortal();
  const isAdmin = state.role === 'admin';

  let viewKey: string;
  let view: ReactNode;

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
          {/* key change remounts the node, replaying the CSS entrance animation */}
          <div key={viewKey} className="view-anim">
            {view}
          </div>
        </div>
      </main>
    </div>
  );
}
