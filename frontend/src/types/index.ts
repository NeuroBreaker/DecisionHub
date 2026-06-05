export type Role = 'PARTICIPANT' | 'JURY' | 'ORGANIZER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
}

export type CheckStatusType = 'PENDING' | 'SUCCESS' | 'FAILED' | 'NOT_SUBMITTED';

export interface CheckStatus {
  status: CheckStatusType;
  message?: string;
  score?: number;
}

export interface Artifacts {
  repoLink?: string;
  repoCheck: CheckStatus;
  documentationUrl?: string;
  docCheck: CheckStatus;
  presentationUrl?: string;
  presentationCheck: CheckStatus;
  screencastUrl?: string;
  screencastCheck: CheckStatus;
  screencastSummary?: string;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  caseId?: string;
  status: 'ACTIVE' | 'SUBMITTED' | 'CHECKED';
  createdAt: string;
}

// Оценка одного члена жюри по критериям из ТЗ
export interface JuryScore {
  id: string;
  juryId: string;
  juryName: string;
  teamId: string;
  completeness: number;       // Полнота MVP (0–10, вес 20%)
  autoChecksQuality: number;  // Качество автопроверок (0–10, вес 15%)
  algorithmicModule: number;  // Алгоритмический модуль (0–10, вес 10%)
  architectureQuality: number;// Архитектура и код (0–10, вес 10%)
  ux: number;                 // UX/UI (0–10, вес 10%)
  standWork: number;          // Работоспособность стенда (0–10, вес 10%)
  documentation: number;      // Документация (0–10, вес 7%)
  presentation: number;       // Презентация и скринкаст (0–10, вес 6%)
  innovation: number;         // Инновационность (0–10, вес 6%)
  oralDefense: number;        // Очная защита (0–10, вес 6%)
  comment: string;
  submittedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  team: Team;
  artifacts: Artifacts;
  autoScore: number;      // авто-баллы (raw, 0–40)
  juryScores: JuryScore[];
  avgJuryScore: number;   // средняя экспертная оценка (0–10)
  totalScore: number;     // взвешенная итоговая (0–10)
  isFinalized: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  teamName?: string; // только для участника — создать/вступить в команду
}
