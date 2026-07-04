import { useState } from 'react';
import { Check, Copy, Link2, UserPlus } from 'lucide-react';
import { usePortal } from '../../store/PortalContext';

export function InviteClient() {
  const { session } = usePortal();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setLink('');
    setCopied(false);
    try {
      const res = await fetch('/api/create-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ email: email.trim(), redirectTo: window.location.origin }),
      });
      if (res.status === 404) {
        setError('Invite links only work on your live site. Deploy to Vercel and generate them there.');
        return;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Could not create the invite link.');
        return;
      }
      setLink(json.link);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  };

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        <UserPlus size={17} /> Invite a client
      </button>
    );
  }

  return (
    <div className="card card-pad invite-card">
      <div className="row between wrap" style={{ gap: 10, marginBottom: 4 }}>
        <div className="row" style={{ gap: 9 }}>
          <span className="invite-ico">
            <UserPlus size={17} />
          </span>
          <h3 style={{ fontSize: 16, fontWeight: 800 }}>Invite a client</h3>
        </div>
        <button className="btn-link" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      <p className="muted" style={{ fontSize: 13, marginBottom: 14 }}>
        Enter their email, generate a private sign-in link, then send it however you like — WhatsApp, email, SMS.
        No password needed on their end.
      </p>

      <form onSubmit={generate} className="invite-form">
        <input
          className="input"
          type="email"
          required
          placeholder="client@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Generating…' : 'Generate link'} <Link2 size={16} />
        </button>
      </form>

      {error && <div className="invite-error">{error}</div>}

      {link && (
        <div className="invite-result">
          <div className="invite-result-label">
            <Check size={14} strokeWidth={3} /> Link ready for <strong>{email}</strong> — send it to them:
          </div>
          <div className="invite-link-row">
            <input className="input invite-link-input" readOnly value={link} onFocus={(e) => e.target.select()} />
            <button className="btn btn-soft" onClick={copy} type="button">
              {copied ? (
                <>
                  <Check size={15} /> Copied
                </>
              ) : (
                <>
                  <Copy size={15} /> Copy
                </>
              )}
            </button>
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            One-time link. When they click it, their portal opens on Phase 1.
          </p>
        </div>
      )}
    </div>
  );
}
