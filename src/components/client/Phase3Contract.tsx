import { Check } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { Field } from '../ui/Field';
import { OrbitMark } from '../ui/Logo';

/** Friendly, plain-English summary of what the client is agreeing to. */
const PLAIN_POINTS: [string, string][] = [
  ['What we’ll do', 'We build what we agreed on together. If you want to change something later, we’ll simply agree on it first.'],
  ['Getting started', 'Work begins once your first payment comes through, and we keep to the schedule as long as we get your feedback on time.'],
  ['Payments', 'Your project lead prepares a clear quote for you. Invoices are due within 7 days.'],
  ['Revisions', 'Each thing we deliver includes two rounds of changes — plenty of room to get it just right.'],
  ['It’s yours', 'Once everything is paid, the final work is 100% yours to keep.'],
  ['Peace of mind', 'Your details stay private, and if anything we built breaks in the first 30 days after launch, we fix it free.'],
];

/** The full legal wording, available but tucked away so it isn’t overwhelming. */
const FULL_TERMS: [string, string][] = [
  ['1. Parties.', 'This Agreement is between Orbit ("Provider") and the Client named below for the delivery of the referenced project.'],
  ['2. Scope of Work.', 'Provider will deliver the services agreed during onboarding. Changes are agreed in writing before work begins.'],
  ['3. Timeline.', 'Work begins upon receipt of the initial payment and follows the agreed schedule, subject to timely client feedback.'],
  ['4. Fees & Payment.', 'Fees are set out in the quote provided. Invoices are due within 7 days of issue unless otherwise stated.'],
  ['5. Client Responsibilities.', 'Client will provide content, access, and approvals promptly. Delays may shift the timeline accordingly.'],
  ['6. Revisions.', 'Each deliverable includes two rounds of revision. Additional rounds are billed at the agreed hourly rate.'],
  ['7. Change Requests.', 'Work beyond the agreed scope is quoted separately and begins only after written approval.'],
  ['8. Intellectual Property.', 'Upon full payment, ownership of final deliverables transfers to Client. Provider retains rights to portfolio use.'],
  ['9. Confidentiality.', 'Both parties keep confidential information private and use it solely for this engagement.'],
  ['10. Warranties.', 'Provider warrants professional delivery and a 30-day bug-fix window after launch for in-scope work.'],
  ['11. Termination.', "Either party may terminate with 14 days' written notice; Client pays for work completed to date."],
  ['12. Governing Law.', 'This Agreement is governed by the laws of the Islamic Republic of Pakistan.'],
];

export function Phase3Contract() {
  const { activeClient } = usePortal();

  const rawBudget = activeClient.phases[1].data['Rough budget'];
  const budget = Array.isArray(rawBudget) ? rawBudget[0] : rawBudget;
  const showBudget = budget && budget !== 'Not sure yet';

  return (
    <div className="stack" style={{ gap: 20 }}>
      {/* Plain-language agreement */}
      <section className="form-sec">
        <div className="row" style={{ gap: 12, marginBottom: 6 }}>
          <span className="step-num">A</span>
          <h3 style={{ fontSize: 18, fontWeight: 800 }}>What you’re agreeing to</h3>
        </div>
        <p className="sec-sub">The short, friendly version — no legal degree required.</p>

        <div className="plain-points">
          {PLAIN_POINTS.map(([h, body]) => (
            <div className="plain-point" key={h}>
              <span className="plain-check">
                <Check size={14} strokeWidth={3} />
              </span>
              <div>
                <div className="plain-point-title">{h}</div>
                <div className="plain-point-body">{body}</div>
              </div>
            </div>
          ))}
        </div>

        <details className="full-terms">
          <summary>Read the full terms (12 clauses)</summary>
          <div className="full-terms-body">
            {FULL_TERMS.map(([h, body]) => (
              <p key={h}>
                <strong>{h}</strong> {body}
              </p>
            ))}
          </div>
        </details>

        <div className="sign-row">
          <div style={{ flex: 1, minWidth: 240 }}>
            <Field label="Sign here — just type your full name">
              <input className="input input-signature" name="Signature" placeholder="Your full name" required />
            </Field>
          </div>
          <label className="agree-check">
            <input type="checkbox" name="Agreed" value="Agreed" required />
            I've read this and I'm happy to go ahead.
          </label>
        </div>
      </section>

      {/* Quote & payment — honest placeholder, no surprise bill */}
      <section className="form-sec invoice">
        <div className="invoice-head">
          <div>
            <div className="row" style={{ gap: 9 }}>
              <OrbitMark size={24} satellite={false} />
              <span style={{ fontWeight: 800, fontSize: 18 }}>Orbit</span>
            </div>
            <div className="invoice-org">
              Orbit Studio
              <br />
              Lahore, Pakistan
              <br />
              hello@orbit.studio
            </div>
          </div>
          <div>
            <div className="invoice-word">YOUR QUOTE</div>
            <div className="invoice-meta">
              Prepared just for you
              <br />
              <strong>Nothing to pay today</strong>
            </div>
          </div>
        </div>

        <div className="invoice-body">
          <div style={{ marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 5 }}>
              For
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{activeClient.company}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{activeClient.contact}</div>
          </div>

          <div className="quote-note">
            {showBudget && (
              <>
                You told us your budget is around <strong>{budget}</strong>, so we’ll tailor a plan that fits.{' '}
              </>
            )}
            Once we’ve scoped the work together, your project lead prepares a clear, itemised quote and sends your
            invoice right here — no surprises. There’s <strong>nothing to pay today</strong>.
          </div>

          <div className="pay-box">
            <div className="section-label" style={{ marginBottom: 8 }}>
              When it’s time, here’s how you can pay
            </div>
            <div className="pay-grid">
              <div>
                <strong>Bank transfer:</strong> Orbit Studio
              </div>
              <div>
                <strong>IBAN:</strong> PK00 ORBT 0000 0000 1234
              </div>
              <div>
                <strong>Wise / Payoneer:</strong> hello@orbit.studio
              </div>
              <div>
                <strong>PayPal:</strong> paypal.me/orbitstudio
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
