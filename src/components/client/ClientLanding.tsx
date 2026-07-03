import type { CSSProperties } from 'react';
import { ArrowRight, Check, Clock, MessageCircle, Sparkles, X } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { currentPhaseOf } from '../../store/portalReducer';
import { phaseMeta, statusInfo, PHASE_BLURB, PHASE_CTA, PHASE_FACTS } from '../../data/phases';
import { StatusBadge } from '../ui/Badge';
import { Stepper } from './Stepper';
import './ClientLanding.css';

export function ClientLanding() {
  const { state, dispatch, activeClient } = usePortal();
  const ac = activeClient;
  const cur = currentPhaseOf(ac);
  const curStatus = ac.phases[cur].status;
  const info = statusInfo(curStatus, cur);
  const meta = phaseMeta(cur);
  const firstName = ac.contact.split(' ')[0];

  const isOpen = curStatus === 'open';
  const isSubmitted = curStatus === 'submitted';
  const isComplete = curStatus === 'approved' && cur === 4;

  const approvedCount = ([1, 2, 3, 4] as const).filter((n) => ac.phases[n].status === 'approved').length;
  const pct = Math.round((approvedCount / 4) * 100);

  // active unread banner for this client
  const nt = state.notifications.filter((n) => n.clientId === ac.id && !n.read).slice(-1)[0];

  return (
    <div>
      {/* Notification banner */}
      {nt && (
        <div className="banner slide-down">
          <div className="banner-icon">
            <Check size={18} strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="banner-title">
              Good news — your {phaseMeta(nt.phase).short} phase is now open!
            </div>
            <div className="banner-body">
              Phase {nt.phase} — {phaseMeta(nt.phase).title} has been unlocked by your Orbit team. Start it
              whenever you're ready.
            </div>
          </div>
          <button className="btn btn-success btn-sm" onClick={() => dispatch({ type: 'BANNER_VIEW' })}>
            Open it
          </button>
          <button className="banner-x" onClick={() => dispatch({ type: 'DISMISS_BANNER' })} aria-label="Dismiss">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Hero */}
      <section className="hero">
        <span className="hero-ring r1" />
        <span className="hero-ring r2" />
        <span className="hero-ring r3" />
        <div className="hero-content">
          <div className="hero-left">
            <div className="eyebrow eyebrow-light">Your Onboarding Journey</div>
            <h1 className="hero-title">
              Welcome, {firstName} <span className="wave">👋</span>
            </h1>
            <p className="hero-sub">
              We're excited to build with <strong>{ac.company}</strong>. Complete each phase below — your Orbit
              team opens the next one as soon as we've reviewed your work.
            </p>
            <div className="hero-tagline">Engineered for the Future. Built for Today.</div>
          </div>

          <div className="hero-progress">
            <div className="ring-wrap" style={{ '--pct': pct } as CSSProperties}>
              <div className="ring-inner">
                <div className="ring-pct">{pct}%</div>
                <div className="ring-label">complete</div>
              </div>
            </div>
            <div className="hero-progress-caption">
              {approvedCount} of 4 phases approved
            </div>
          </div>
        </div>
      </section>

      {/* Grid: stepper + current phase */}
      <div className="landing-grid">
        <Stepper client={ac} />

        <div>
          <div className="card card-accent card-pad phase-card">
            <div className="row between wrap" style={{ gap: 14 }}>
              <div>
                <div className="eyebrow">Phase {cur}</div>
                <h2 className="phase-card-title">{meta.title}</h2>
              </div>
              <StatusBadge info={info} />
            </div>

            {isOpen && (
              <div>
                <p className="phase-card-blurb">{PHASE_BLURB[cur]}</p>
                <div className="fact-row">
                  {PHASE_FACTS[cur].map((f) => (
                    <div className="fact" key={f.label}>
                      <div className="fact-value">{f.value}</div>
                      <div className="fact-label">{f.label}</div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => dispatch({ type: 'OPEN_PHASE', n: cur })}
                >
                  {PHASE_CTA[cur]} <ArrowRight size={18} />
                </button>
              </div>
            )}

            {isSubmitted && (
              <div className="state-box submitted">
                <div className="state-icon">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="state-title">Submitted — awaiting review</div>
                  <p className="state-text">
                    Thanks, {firstName}! Your Orbit team is reviewing your submission. We'll email you and light
                    up the next phase here the moment it's approved — usually within one business day.
                  </p>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="state-complete">
                <div style={{ fontSize: 42 }}>🎉</div>
                <div className="state-complete-title">All phases complete!</div>
                <p className="muted" style={{ fontSize: 14 }}>
                  Welcome aboard — your project is officially underway.
                </p>
              </div>
            )}
          </div>

          {/* Support note */}
          <div className="support-note">
            <span className="support-ico">
              <MessageCircle size={18} />
            </span>
            <span>
              Questions at any stage? Email <a href="mailto:hello@orbit.studio">hello@orbit.studio</a> — we
              usually reply within a few hours.
            </span>
            <span className="support-badge hide-sm">
              <Sparkles size={13} /> Avg. reply 2h
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
