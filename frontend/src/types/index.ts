export type Role = 'PARTICIPANT' | 'JURY' | 'ORGANIZER';

export interface User {
  id: string;
  name: string;
  role: Role;
  teamId?: string;
}

export interface CheckStatus {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  message?: string;
  score?: number; // Балл от автопроверки
}

export interface Artifacts {
  repoLink: string;
  repoCheck: CheckStatus;
  documentationUrl?: string;
  docCheck: CheckStatus;
  presentationUrl?: string;
  presentationCheck: CheckStatus;
  screencastUrl?: string;
  screencastCheck: CheckStatus;
  screencastSummary?: string; // AI саммари
}
