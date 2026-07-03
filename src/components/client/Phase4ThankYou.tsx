import { Globe, Handshake, Mail, MessageCircle, Megaphone, Star } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';
import { OrbitMark } from '../ui/Logo';
import './Phase4.css';

const FAVORS = [
  { icon: Handshake, label: 'Refer a friend' },
  { icon: Star, label: 'Leave a review' },
  { icon: Megaphone, label: 'Follow along' },
];

export function Phase4ThankYou() {
  const { dispatch, activeClient } = usePortal();
  const firstName = activeClient.contact.split(' ')[0];

  return (
    <div>
      <div className="card card-accent thankyou-hero">
        <div style={{ fontSize: 52 }}>🚀</div>
        <h2 className="thankyou-title">Thank you, {firstName}!</h2>
        <p className="thankyou-sub">
          Every step is done — <strong>{activeClient.company}</strong> is officially an Orbit client. Your project
          lead will be in touch within one business day. Your portal stays open for the whole project, so pop back
          anytime.
        </p>
      </div>

      <div className="contact-card thankyou-contact">
        <div className="row" style={{ gap: 10, marginBottom: 12 }}>
          <OrbitMark size={26} satellite={false} />
          <span style={{ fontWeight: 800, fontSize: 17 }}>Your Orbit team is one message away</span>
        </div>
        <div className="contact-lines">
          <div>
            <Mail size={16} /> hello@orbit.studio
          </div>
          <div>
            <MessageCircle size={16} /> WhatsApp: +92 300 1122334
          </div>
          <div>
            <Globe size={16} /> orbit.studio
          </div>
        </div>
        <div className="contact-tagline">Engineered for the Future. Built for Today.</div>
      </div>

      <div className="favor-strip card card-pad">
        <div>
          <div className="eyebrow">A small favor</div>
          <div className="favor-strip-title">Loved working with us? 💛</div>
        </div>
        <div className="favor-links">
          {FAVORS.map(({ icon: Icon, label }) => (
            <button className="btn btn-soft btn-sm" key={label}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            dispatch({ type: 'BACK_TO_LANDING' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Back to my portal
        </button>
      </div>
    </div>
  );
}
