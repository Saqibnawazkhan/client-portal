import { ArrowLeft, Check, Lock, Unlock } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { currentPhaseOf } from '../../store/portalReducer';
import { phaseMeta, statusInfo } from '../../data/phases';
import { initials } from '../../lib/format';
import type { PhaseNumber } from '../../types';
import { StatusBadge } from '../ui/Badge';
import './Admin.css';

export function AdminClientDetail() {
  const { state, dispatch, getClient } = usePortal();
  const client = getClient(state.selectedClientId!);
  if (!client) return null;

  const cur = currentPhaseOf(client);
  const phases: PhaseNumber[] = [1, 2, 3, 4];

  return (
    <div>
      <button className="btn-link" onClick={() => dispatch({ type: 'ADMIN_BACK' })}>
        <ArrowLeft size={16} /> Back to pipeline
      </button>

      {/* Header */}
      <div className="card card-accent detail-head">
        <div className="detail-avatar avatar">{initials(client.company)}</div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>{client.company}</h1>
          <div className="muted" style={{ fontSize: 13.5, marginTop: 3 }}>
            {client.contact} · {client.email}
          </div>
          <div className="muted-2" style={{ fontSize: 13, marginTop: 2 }}>
            {client.industry} · {client.service} · Phase {cur} · {phaseMeta(cur).short}
          </div>
        </div>
      </div>

      {/* Per-phase cards */}
      {phases.map((n) => {
        const status = client.phases[n].status;
        const info = statusInfo(status, n);
        const meta = phaseMeta(n);
        const entries = Object.entries(client.phases[n].data || {}).map(([k, v]) => ({
          label: k,
          value: Array.isArray(v) ? v.join(', ') : String(v),
        }));
        const canApprove = status === 'submitted';
        const canToggle = status === 'locked' || status === 'open';
        const approveLabel = n < 4 ? `Approve & Open Phase ${n + 1}` : 'Approve & Mark Complete';
        const emptyNote =
          entries.length === 0
            ? status === 'locked'
              ? 'Locked — not yet available to the client.'
              : status === 'open'
                ? "Open — awaiting the client's submission."
                : ''
            : '';

        return (
          <div className="card detail-phase" key={n}>
            <div className="row between wrap" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 11 }}>
                <span className={`phase-chip variant-${info.variant}`}>{n}</span>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>
                  Phase {n} — {meta.title}
                </h3>
                <StatusBadge info={info} />
              </div>
              <div className="row wrap" style={{ gap: 10 }}>
                {canToggle && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => dispatch({ type: 'TOGGLE_LOCK', id: client.id, n })}
                  >
                    {status === 'locked' ? (
                      <>
                        <Unlock size={14} /> Unlock
                      </>
                    ) : (
                      <>
                        <Lock size={14} /> Lock
                      </>
                    )}
                  </button>
                )}
                {canApprove && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => dispatch({ type: 'APPROVE', id: client.id, n, notify: true })}
                  >
                    <Check size={15} strokeWidth={3} /> {approveLabel}
                  </button>
                )}
              </div>
            </div>

            {entries.length > 0 && (
              <div className="entry-grid">
                {entries.map((e) => (
                  <div key={e.label} style={{ minWidth: 0 }}>
                    <div className="entry-label">{e.label}</div>
                    <div className="entry-value">{e.value}</div>
                  </div>
                ))}
              </div>
            )}

            {emptyNote && <div className="empty-note">{emptyNote}</div>}
          </div>
        );
      })}
    </div>
  );
}
