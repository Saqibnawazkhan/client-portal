import { useState } from 'react';
import { ArrowRight, MailCheck, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrbitMark } from '../ui/Logo';
import './Auth.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim()) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <OrbitMark size={40} />
          <div>
            <div className="auth-brand-name">Orbit</div>
            <div className="auth-brand-sub">Client Portal</div>
          </div>
        </div>

        {sent ? (
          <div className="auth-sent">
            <div className="auth-sent-ico">
              <MailCheck size={26} />
            </div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-sub">
              We sent a secure sign-in link to <strong>{email}</strong>. Click it and you’ll be right in — no
              password needed.
            </p>
            <button className="btn btn-ghost" onClick={() => setSent(false)}>
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Welcome 👋</h1>
            <p className="auth-sub">
              Enter your email and we’ll send you a secure sign-in link. No passwords to remember.
            </p>
            <form onSubmit={submit} className="auth-form">
              <input
                className="input"
                type="email"
                required
                autoFocus
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
                {busy ? 'Sending…' : 'Email me a sign-in link'} <ArrowRight size={18} />
              </button>
              {error && <div className="auth-error">{error}</div>}
            </form>
            <div className="auth-note">
              <Sparkles size={14} /> Engineered for the Future. Built for Today.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
