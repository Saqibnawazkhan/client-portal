import type { PhaseMeta, PhaseNumber, PhaseStatus } from '../types';

export const PHASE_META: Record<PhaseNumber, PhaseMeta> = {
  1: { title: 'Get Started', short: 'Get Started', hint: 'A quick hello and a bit about your project.' },
  2: { title: 'Your Vision & Style', short: 'Vision & Style', hint: 'The look, feel and who it’s for — no tech talk.' },
  3: { title: 'Agreement & Payment', short: 'Agreement', hint: 'A short, plain-English agreement, then you’re set.' },
  4: { title: 'Thank You', short: 'Thank You', hint: "You're all set — welcome aboard." },
};

export interface StatusInfo {
  label: string;
  variant: 'locked' | 'open' | 'submitted' | 'approved';
}

export function statusInfo(status: PhaseStatus, n: PhaseNumber): StatusInfo {
  if (status === 'approved' && n === 4) return { label: 'Complete', variant: 'approved' };
  const map: Record<PhaseStatus, StatusInfo> = {
    locked: { label: 'Locked', variant: 'locked' },
    open: { label: 'Open', variant: 'open' },
    submitted: { label: 'Submitted', variant: 'submitted' },
    approved: { label: 'Approved', variant: 'approved' },
  };
  return map[status];
}

export function phaseMeta(n: PhaseNumber): PhaseMeta {
  return PHASE_META[n];
}

export const PHASE_FACTS: Record<PhaseNumber, { value: string; label: string }[]> = {
  1: [
    { value: '~2 min', label: 'To complete' },
    { value: '2', label: 'Short sections' },
    { value: '0', label: 'Tech skills needed' },
  ],
  2: [
    { value: '~3 min', label: 'To complete' },
    { value: 'No', label: 'Jargon' },
    { value: 'Tap', label: 'To pick a vibe' },
  ],
  3: [
    { value: '~2 min', label: 'To complete' },
    { value: '1', label: 'Quick signature' },
    { value: 'Plain', label: 'English terms' },
  ],
  4: [
    { value: '🎉', label: 'You made it' },
    { value: '∞', label: 'Support' },
    { value: '1', label: 'Small favor' },
  ],
};

export const PHASE_CTA: Record<PhaseNumber, string> = {
  1: 'Get Started',
  2: 'Share Your Vision',
  3: 'Review & Sign',
  4: 'Open your welcome',
};

export const PHASE_BLURB: Record<PhaseNumber, string> = {
  1: "Let's say hello. Just your contact details and a few plain questions about what you'd like to build — no forms full of jargon.",
  2: 'Now the fun part — the look, the feel, and who it’s for. Tap a few options and add anything you love. We handle all the technical bits.',
  3: 'Almost there. A short, friendly agreement in plain English, a quick signature, and your first invoice — then we get to work.',
  4: "That's everything — thank you for trusting Orbit. Open your welcome to see what happens next and a small favor we'd love.",
};

export const SUBMIT_LABEL: Record<PhaseNumber, string> = {
  1: 'Send to Orbit',
  2: 'Send to Orbit',
  3: 'Sign & finish',
  4: 'Done',
};
