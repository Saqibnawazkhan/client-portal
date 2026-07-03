import { LogOut } from 'lucide-react';
import { usePortal } from '../store/PortalContext';
import { OrbitLogo } from './ui/Logo';
import './TopBar.css';

export function TopBar() {
  const { dispatch, session, role, signOut } = usePortal();
  const email = session?.user?.email ?? '';

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <OrbitLogo onClick={() => dispatch({ type: 'HOME' })} />

        <div className="topbar-actions">
          {role === 'admin' && <span className="role-chip">Admin</span>}
          <span className="topbar-email hide-sm" title={email}>
            {email}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={signOut} title="Sign out">
            <LogOut size={15} />
            <span className="hide-sm">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
