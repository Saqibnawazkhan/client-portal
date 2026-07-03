import { Fragment } from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Get Started' },
  { n: 2, label: 'Vision & Style' },
  { n: 3, label: 'Agreement' },
];

/** Compact 3-step journey indicator shown at the top of each form phase. */
export function PhaseMiniStepper({ current }: { current: number }) {
  return (
    <div className="mini-stepper" aria-label={`Step ${current} of 3`}>
      {STEPS.map((s, i) => {
        const state = s.n < current ? 'done' : s.n === current ? 'current' : 'upcoming';
        return (
          <Fragment key={s.n}>
            <div className={`mini-step ${state}`}>
              <span className="mini-dot">{state === 'done' ? <Check size={13} strokeWidth={3} /> : s.n}</span>
              <span className="mini-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mini-line${s.n < current ? ' done' : ''}`} />}
          </Fragment>
        );
      })}
    </div>
  );
}
