import type {
  ActivityItem,
  Client,
  PhaseNumber,
  PhaseState,
  PhaseStatus,
  PortalState,
} from '../types';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z]+/g, '');

export const initials = (company: string) =>
  company
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Generate believable prefilled data for an already-submitted/approved phase. */
function gen(
  n: PhaseNumber,
  company: string,
  contact: string,
  service: string,
): Record<string, string | string[]> {
  const s = slug(company);
  if (n === 1)
    return {
      'Your name': contact,
      'Company or brand': company,
      Email: 'team@' + s + '.com',
      'Phone or WhatsApp': '+92 300 000 0000',
      'Best way to reach you': 'Email',
      'What can we help you build?':
        service === 'Web Development'
          ? 'A website'
          : service === 'Mobile Development'
            ? 'A mobile app'
            : service === 'AI Chatbot'
              ? 'An AI chatbot'
              : service === 'Design'
                ? 'Design / branding'
                : 'Something else',
      'Tell us about your project':
        'We want to modernise our digital presence and give customers a fast, on-brand experience.',
      'What would make this a success?': 'More enquiries coming in, and a look we’re proud to share.',
      'Budget currency': 'USD',
      'Rough budget': '$5k – $15k',
      'Ideal timeline': 'In 4–8 weeks',
    };
  if (n === 2)
    return {
      'Who are your customers?': 'Existing customers plus new prospects, mostly ages 25–45.',
      'Current website': 'https://' + s + '.com',
      Vibe: ['Minimal', 'Modern', 'Premium'],
      'Websites or brands you love': 'We love the clean feel of Apple and Notion.',
      'Brand colors': 'Warm orange & charcoal',
      'Things to avoid': 'Nothing too corporate or cluttered.',
      Ready: ['A logo', 'Photos or images'],
    };
  if (n === 3)
    return {
      Signature: contact,
      Agreed: 'Agreed',
      'Payment status': 'Paid',
    };
  return {};
}

function mkPhases(
  cp: PhaseNumber,
  status: PhaseStatus,
  company: string,
  contact: string,
  service: string,
): Record<PhaseNumber, PhaseState> {
  const ph = {} as Record<PhaseNumber, PhaseState>;
  for (let n = 1 as PhaseNumber; n <= 4; n = (n + 1) as PhaseNumber) {
    if (n < cp) ph[n] = { status: 'approved', data: gen(n, company, contact, service) };
    else if (n === cp)
      ph[n] = { status, data: status === 'submitted' ? gen(n, company, contact, service) : {} };
    else ph[n] = { status: 'locked', data: {} };
  }
  return ph;
}

type Def = [string, string, string, string, string, PhaseNumber, PhaseStatus];

const DEFS: Def[] = [
  ['c1', 'Lumen Skincare', 'Ayesha Khan', 'Beauty & Cosmetics', 'Web Development', 1, 'open'],
  ['c2', 'Verde Coffee', 'Marco Ruiz', 'Food & Beverage', 'Mobile Development', 1, 'submitted'],
  ['c3', 'Atlas Fintech', 'Dana Okafor', 'Financial Services', 'AI Chatbot', 2, 'open'],
  ['c4', 'Bloom Wellness', 'Priya Nair', 'Health & Wellness', 'Design', 2, 'submitted'],
  ['c5', 'Nimbus SaaS', 'Leo Fischer', 'Software', 'Web Development', 3, 'open'],
  ['c6', 'Pulse Fitness', 'Sam Turner', 'Fitness', 'Mobile Development', 3, 'submitted'],
  ['c7', 'Coral Travel', 'Mia Rossi', 'Travel & Hospitality', 'Web Development', 4, 'open'],
  ['c8', 'Meridian Health', 'Omar Farouk', 'Healthcare', 'Model Training', 4, 'approved'],
  ['c9', 'Zephyr Logistics', 'Hana Kim', 'Logistics', 'Web Development', 2, 'open'],
  ['c10', 'Orbit Ventures', 'Yusuf Ali', 'Venture Capital', 'AI Chatbot', 1, 'open'],
];

const ACTIVITY: ActivityItem[] = [
  { id: 'a1', t: 'Pulse Fitness submitted Phase 3 — Agreement', kind: 'submit', ago: '12m ago' },
  { id: 'a2', t: 'You approved Nimbus SaaS Phase 2 — Vision & Style', kind: 'approve', ago: '1h ago' },
  { id: 'a3', t: 'Bloom Wellness submitted Phase 2 — Vision & Style', kind: 'submit', ago: '3h ago' },
  { id: 'a4', t: 'Verde Coffee submitted Phase 1 — Get Started', kind: 'submit', ago: '5h ago' },
  { id: 'a5', t: 'You approved Coral Travel Phase 3 — Agreement', kind: 'approve', ago: 'Yesterday' },
];

export function seed(role: 'client' | 'admin' = 'client'): PortalState {
  const clients: Client[] = DEFS.map((d) => ({
    id: d[0],
    company: d[1],
    contact: d[2],
    industry: d[3],
    service: d[4],
    email: 'team@' + slug(d[1]) + '.com',
    phases: mkPhases(d[5], d[6], d[1], d[2], d[4]),
  }));

  return {
    role,
    screen: 'landing',
    activePhase: 1,
    activeClientId: 'c1',
    selectedClientId: null,
    clients,
    activity: ACTIVITY,
    notifications: [],
  };
}
