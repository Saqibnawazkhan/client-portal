export type Role = 'client' | 'admin';

export type PhaseStatus = 'locked' | 'open' | 'submitted' | 'approved';

export type PhaseNumber = 1 | 2 | 3 | 4;

export interface PhaseState {
  status: PhaseStatus;
  data: Record<string, string | string[]>;
}

export interface Client {
  id: string;
  company: string;
  contact: string;
  industry: string;
  service: string;
  email: string;
  phases: Record<PhaseNumber, PhaseState>;
}

export interface Notification {
  id: string;
  clientId: string;
  phase: PhaseNumber;
  read: boolean;
}

export type ActivityKind = 'submit' | 'approve';

export interface ActivityItem {
  id: string;
  t: string;
  kind: ActivityKind;
  ago: string;
}

export type ClientScreen = 'landing' | 'phase';

export interface PortalState {
  role: Role;
  screen: ClientScreen;
  activePhase: PhaseNumber;
  activeClientId: string;
  selectedClientId: string | null;
  clients: Client[];
  activity: ActivityItem[];
  notifications: Notification[];
}

export interface PhaseMeta {
  title: string;
  short: string;
  hint: string;
}
