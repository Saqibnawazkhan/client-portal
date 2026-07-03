import { RotateCcw } from 'lucide-react';
import { usePortal, resetState } from '../store/PortalContext';
import { OrbitLogo } from './ui/Logo';
import './TopBar.css';

export function TopBar() {
  const { state, dispatch } = usePortal();
  const isAdmin = state.role === 'admin';

  const onReset = () => {
    if (window.confirm('Reset all demo data to the starting state?')) {
      dispatch({ type: 'RESET', state: resetState() });
    }
  };

  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <OrbitLogo onClick={() => dispatch({ type: 'HOME' })} />

        <div className="topbar-actions">
          <div className="role-switch" role="tablist" aria-label="Switch role">
            <span className={`role-thumb ${isAdmin ? 'is-admin' : ''}`} aria-hidden />
            <button
              role="tab"
              aria-selected={!isAdmin}
              className={`role-btn ${!isAdmin ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ROLE', role: 'client' })}
            >
              Client
            </button>
            <button
              role="tab"
              aria-selected={isAdmin}
              className={`role-btn ${isAdmin ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_ROLE', role: 'admin' })}
            >
              Admin
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onReset} title="Reset demo data">
            <RotateCcw size={15} />
            <span className="hide-sm">Reset demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
