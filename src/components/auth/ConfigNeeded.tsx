import { Database } from 'lucide-react';
import { OrbitMark } from '../ui/Logo';
import './Auth.css';

export function ConfigNeeded() {
  return (
    <div className="auth-wrap">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <OrbitMark size={40} />
          <div>
            <div className="auth-brand-name">Orbit</div>
            <div className="auth-brand-sub">Client Portal</div>
          </div>
        </div>

        <div className="auth-sent-ico">
          <Database size={26} />
        </div>
        <h1 className="auth-title">Almost there — connect your database</h1>
        <p className="auth-sub">
          This portal runs on Supabase. Add your project’s two keys and it goes live. Full steps are in{' '}
          <strong>SUPABASE_SETUP.md</strong>.
        </p>

        <ol className="auth-steps">
          <li>
            Create a free project at <strong>supabase.com</strong>.
          </li>
          <li>
            In the SQL Editor, run <strong>supabase/schema.sql</strong> from this repo.
          </li>
          <li>
            Add these to <strong>.env.local</strong> (and your Vercel project’s Environment Variables):
            <pre className="auth-code">
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=your-anon-key
            </pre>
          </li>
          <li>Restart the dev server (or redeploy) — done.</li>
        </ol>
      </div>
    </div>
  );
}
