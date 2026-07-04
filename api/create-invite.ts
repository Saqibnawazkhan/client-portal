import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// These come from your Vercel Environment Variables.
// SUPABASE_SERVICE_ROLE_KEY is server-only (never exposed to the browser).
const SUPABASE_URL = process.env.VITE_SUPABASE_URL as string;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY as string;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
    return res.status(500).json({
      error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.',
    });
  }

  try {
    // 1) Verify the caller is a signed-in ADMIN.
    const token = String(req.headers.authorization ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Not signed in' });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return res.status(401).json({ error: 'Your session has expired — sign in again.' });

    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Admins only.' });

    // 2) Generate an invite (new client) or magic link (existing client).
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Please enter a valid email.' });
    const redirectTo = String(req.body?.redirectTo ?? '') || undefined;

    let result = await admin.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo } });
    if (result.error && /already|registered|exist/i.test(result.error.message)) {
      result = await admin.auth.admin.generateLink({ type: 'magiclink', email, options: { redirectTo } });
    }
    if (result.error) return res.status(400).json({ error: result.error.message });

    const link = result.data?.properties?.action_link;
    if (!link) return res.status(500).json({ error: 'Could not generate a link.' });

    return res.status(200).json({ link, email });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : 'Unexpected error' });
  }
}
