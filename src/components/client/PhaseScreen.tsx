import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { phaseMeta, SUBMIT_LABEL } from '../../data/phases';
import { Phase1Form } from './Phase1Form';
import { Phase2Form } from './Phase2Form';
import { Phase3Contract } from './Phase3Contract';
import { Phase4ThankYou } from './Phase4ThankYou';
import { PhaseMiniStepper } from './PhaseMiniStepper';
import './PhaseScreen.css';

export function PhaseScreen() {
  const { state, dispatch } = usePortal();
  const formRef = useRef<HTMLFormElement>(null);
  const ap = state.activePhase;
  const meta = phaseMeta(ap);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string | string[]> = {};
    for (const [k, v] of fd.entries()) {
      const val = String(v).trim();
      if (!val) continue;
      if (data[k] !== undefined) data[k] = ([] as string[]).concat(data[k], val);
      else data[k] = val;
    }
    dispatch({ type: 'SUBMIT_PHASE', data });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    dispatch({ type: 'BACK_TO_LANDING' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <button className="btn-link" onClick={goBack}>
        <ArrowLeft size={16} /> Back to your portal
      </button>

      {/* phase hero */}
      <div className="phase-hero">
        <span className="hero-ring r1" />
        <div className="phase-hero-inner">
          <div className="eyebrow eyebrow-light">{ap === 4 ? "You're all done" : `Step ${ap} of 3`}</div>
          <h1 className="phase-hero-title">{meta.title}</h1>
          <p className="phase-hero-sub">{meta.hint}</p>
        </div>
      </div>

      {ap !== 4 && <PhaseMiniStepper current={ap} />}

      {ap === 4 ? (
        <Phase4ThankYou />
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          {ap === 1 && <Phase1Form />}
          {ap === 2 && <Phase2Form />}
          {ap === 3 && <Phase3Contract />}

          <div className="submit-bar">
            <button type="button" className="btn btn-ghost" onClick={goBack}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-lg">
              {SUBMIT_LABEL[ap]} <ArrowRight size={17} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
