import type { ReactNode } from 'react';
import { ArrowUp, Check, ChevronRight, Users } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { currentPhaseOf } from '../../store/portalReducer';
import { phaseMeta, statusInfo } from '../../data/phases';
import { initials } from '../../lib/format';
import { StatusBadge } from '../ui/Badge';
import { InviteClient } from './InviteClient';
import './Admin.css';

export function AdminDashboard() {
  const { state, dispatch } = usePortal();

  const rows = state.clients.map((c) => {
    const cur = currentPhaseOf(c);
    const status = c.phases[cur].status;
    return {
      id: c.id,
      company: c.company,
      contact: c.contact,
      phaseLabel: `Phase ${cur} · ${phaseMeta(cur).short}`,
      info: statusInfo(status, cur),
      actionNeeded: status === 'submitted',
      initials: initials(c.company),
    };
  });

  const stats = {
    total: state.clients.length,
    action: rows.filter((r) => r.actionNeeded).length,
    complete: state.clients.filter((c) => c.phases[4].status === 'approved').length,
  };

  return (
    <div>
      <div className="row between wrap" style={{ gap: 16, alignItems: 'flex-end', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-0.025em' }}>Client Pipeline</h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            Review submissions and open the next phase for each client.
          </p>
        </div>
        <InviteClient />
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard value={stats.total} label="Active clients" accent="brand" icon={<Users size={18} />} />
        <StatCard
          value={stats.action}
          label="Awaiting your review"
          accent="blue"
          icon={<ArrowUp size={18} />}
          pulse={stats.action > 0}
        />
        <StatCard value={stats.complete} label="Fully onboarded" accent="green" icon={<Check size={18} />} />
      </div>

      <div className="admin-grid">
        {/* Client table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="admin-table-head">All clients</div>
          <div className="stagger">
            {rows.map((r) => (
              <div
                key={r.id}
                className="client-row tappable"
                role="button"
                tabIndex={0}
                onClick={() => dispatch({ type: 'SELECT_CLIENT', id: r.id })}
                onKeyDown={(e) => e.key === 'Enter' && dispatch({ type: 'SELECT_CLIENT', id: r.id })}
              >
                <div className="client-avatar avatar">{r.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="client-name">
                    {r.company}
                    {r.actionNeeded && <span className="action-dot" title="Action needed" />}
                  </div>
                  <div className="client-meta">
                    {r.contact} · {r.phaseLabel}
                  </div>
                </div>
                <StatusBadge info={r.info} />
                <ChevronRight size={18} className="hide-sm" style={{ color: '#D1D5DB', flex: 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="card card-pad">
          <div className="section-label" style={{ marginBottom: 16 }}>
            Recent activity
          </div>
          <div className="stack" style={{ gap: 16 }}>
            {state.activity.map((a) => (
              <div className="activity-item" key={a.id}>
                <div className={`activity-dot ${a.kind}`}>
                  {a.kind === 'approve' ? <Check size={14} strokeWidth={3} /> : <ArrowUp size={14} strokeWidth={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="activity-text">{a.t}</div>
                  <div className="activity-ago">{a.ago}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  accent,
  icon,
  pulse,
}: {
  value: number;
  label: string;
  accent: 'brand' | 'blue' | 'green';
  icon: ReactNode;
  pulse?: boolean;
}) {
  return (
    <div className={`stat-card accent-${accent}`}>
      <div className="stat-top">
        <span className={`stat-ico accent-${accent}`}>{icon}</span>
        {pulse && <span className="stat-pulse" />}
      </div>
      <div className={`stat-value accent-${accent}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
