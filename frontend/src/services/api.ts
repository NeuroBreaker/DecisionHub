import type { User, Team, Artifacts, JuryScore, LeaderboardEntry, RegisterData } from '@/types';

const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('authToken');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('authToken', token);
  else localStorage.removeItem('authToken');
}

// fetch-хелпер
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Ошибка сервера' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Авторизация ─────────────────────────────────────────────
// FastAPI endpoints: POST /api/auth/login, /api/auth/register, GET /api/auth/me
export const authApi = {
  login: (email: string, password: string) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterData) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<User>('/auth/me'),
};

// ─── Команды ─────────────────────────────────────────────────
// FastAPI endpoints: GET/POST /api/teams, GET /api/teams/:id, POST /api/teams/:id/members
export const teamsApi = {
  list: () => request<Team[]>('/teams'),
  get: (id: string) => request<Team>(`/teams/${id}`),
  create: (name: string, caseId?: string) =>
    request<Team>('/teams', { method: 'POST', body: JSON.stringify({ name, caseId }) }),
  addMember: (teamId: string, userId: string) =>
    request<Team>(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// ─── Артефакты ────────────────────────────────────────────────
// FastAPI endpoints: GET /api/artifacts/:teamId
// POST /api/artifacts/repo — принимает { teamId, repoLink }
// POST /api/artifacts/documentation — FormData с file + teamId
// POST /api/artifacts/presentation  — FormData с file + teamId
// POST /api/artifacts/screencast    — принимает { teamId, url }
export const artifactsApi = {
  getByTeam: (teamId: string) => request<any>(`/artifacts/${teamId}`),

  submitRepo: (teamId: string, repoLink: string) =>
    request<Artifacts>('/artifacts/repo', {
      method: 'POST',
      body: JSON.stringify({ teamId, repoLink }),
    }),

  uploadDoc: (teamId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('teamId', teamId);
    return request<Artifacts>('/artifacts/documentation', { method: 'POST', body: fd });
  },

  uploadPresentation: (teamId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('teamId', teamId);
    return request<Artifacts>('/artifacts/presentation', { method: 'POST', body: fd });
  },

  submitScreencast: (teamId: string, url: string) =>
    request<Artifacts>('/artifacts/screencast', {
      method: 'POST',
      body: JSON.stringify({ teamId, url }),
    }),
};

// ─── Оценки жюри ─────────────────────────────────────────────
// FastAPI endpoints: POST /api/scores, GET /api/scores/team/:teamId
export const scoresApi = {
  submit: (
    teamId: string,
    scores: Omit<JuryScore, 'id' | 'juryId' | 'juryName' | 'teamId' | 'submittedAt'>
  ) =>
    request<JuryScore>('/scores', {
      method: 'POST',
      body: JSON.stringify({ teamId, ...scores }),
    }),

  getForTeam: (teamId: string) => request<JuryScore[]>(`/scores/team/${teamId}`),
};

// ─── Лидерборд ───────────────────────────────────────────────
// FastAPI endpoints: GET /api/leaderboard, GET /api/leaderboard/export (CSV)
export const leaderboardApi = {
  get: () => request<LeaderboardEntry[]>('/leaderboard'),
  exportCsvUrl: () => `${API_BASE}/leaderboard/export?token=${authToken}`,
};
