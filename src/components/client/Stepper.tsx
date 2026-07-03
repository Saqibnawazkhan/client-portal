import { Check, Lock } from 'lucide-react';
import type { Client, PhaseNumber } from '../../types';
import { phaseMeta, statusInfo } from '../../data/phases';
import { currentPhaseOf } from '../../store/portalReducer';
import { StatusBadge } from '../ui/Badge';

export function Stepper({ client }: { client: Client }) {
  const cur = currentPhaseOf(client);
  const phases: PhaseNumber[] = [1, 2, 3, 4];

  return (
    <aside className="card card-accent card-pad stepper">
      <div className="section-label" style={{ marginBottom: 18 }}>
        Your Progress
      </div>

      {phases.map((n) => {
        const status = client.phases[n].status;
        const info = statusInfo(status, n);
        const meta = phaseMeta(n);
        const isCur = n === cur;
        const done = status === 'approved';
        const locked = status === 'locked';
        const dotClass =
          'step-dot ' +
          (done ? 'done' : locked ? 'locked' : status === 'submitted' ? 'submitted' : 'open') +
          (isCur && !locked ? ' current' : '');

        return (
          <div className="step-row" key={n}>
            <div className="step-rail">
              <div className={dotClass}>
                {done ? <Check size={16} strokeWidth={3} /> : locked ? <Lock size={13} /> : n}
              </div>
              {n < 4 && <div className={`step-line${done ? ' filled' : ''}`} />}
            </div>
            <div className="step-body">
              <div className={`step-title${locked ? ' is-locked' : ''}`}>{meta.title}</div>
              <div style={{ marginTop: 5 }}>
                <StatusBadge info={info} />
              </div>
              <div className="step-hint">
                {locked ? 'Locked — your Orbit team will open this next.' : meta.hint}
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
