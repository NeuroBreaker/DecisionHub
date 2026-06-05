import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import type { LeaderboardEntry } from '@/types';

// ─── Моковые данные — замените на реальный API-вызов ───────
// TODO: убрать MOCK_DATA и раскомментировать useEffect ниже
const MOCK_DATA: LeaderboardEntry[] = [
  {
    rank: 1,
    team: {
      id: '1', name: 'CyberSamara', status: 'CHECKED', createdAt: '2024-01-01',
      members: [
        { id: '1', name: 'Иван К.', email: 'ivan@example.com', role: 'PARTICIPANT' },
        { id: '2', name: 'Мария В.', email: 'maria@example.com', role: 'PARTICIPANT' },
      ],
    },
    artifacts: {
      repoLink: 'github.com/cybersamara/project',
      repoCheck: { status: 'SUCCESS', score: 38 },
      documentationUrl: 'docs.pdf',
      docCheck: { status: 'SUCCESS', score: 8 },
      presentationUrl: 'slides.pdf',
      presentationCheck: { status: 'SUCCESS', score: 10 },
      screencastUrl: 'youtube.com/watch?v=abc',
      screencastCheck: { status: 'SUCCESS' },
      screencastSummary: 'Показан полный флоу пользователя, авторизация, загрузка артефактов...',
    },
    autoScore: 35, juryScores: [
      { id: 'j1', juryId: 'jury1', juryName: 'Петров А.', teamId: '1', completeness: 9, autoChecksQuality: 8, algorithmicModule: 7, architectureQuality: 9, ux: 8, standWork: 9, documentation: 7, presentation: 8, innovation: 7, oralDefense: 9, comment: 'Отличная работа, хорошая архитектура', submittedAt: '2024-01-06' },
    ],
    avgJuryScore: 8.1, totalScore: 8.7, isFinalized: true,
  },
  {
    rank: 2,
    team: {
      id: '2', name: 'AlgoStars', status: 'CHECKED', createdAt: '2024-01-01',
      members: [
        { id: '3', name: 'Алексей П.', email: 'alex@example.com', role: 'PARTICIPANT' },
        { id: '4', name: 'Денис С.', email: 'denis@example.com', role: 'PARTICIPANT' },
        { id: '5', name: 'Юлия Р.', email: 'julia@example.com', role: 'PARTICIPANT' },
      ],
    },
    artifacts: {
      repoLink: 'github.com/algostars/solution',
      repoCheck: { status: 'SUCCESS', score: 32 },
      documentationUrl: 'docs.pdf',
      docCheck: { status: 'SUCCESS', score: 7 },
      presentationUrl: 'slides.pdf',
      presentationCheck: { status: 'FAILED', message: 'Менее 8 слайдов', score: 3 },
      screencastUrl: 'youtube.com/watch?v=xyz',
      screencastCheck: { status: 'SUCCESS' },
    },
    autoScore: 28, juryScores: [
      { id: 'j2', juryId: 'jury1', juryName: 'Петров А.', teamId: '2', completeness: 7, autoChecksQuality: 7, algorithmicModule: 9, architectureQuality: 8, ux: 7, standWork: 7, documentation: 6, presentation: 5, innovation: 8, oralDefense: 7, comment: 'Хороший алгоритмический модуль, слабая презентация', submittedAt: '2024-01-06' },
    ],
    avgJuryScore: 7.1, totalScore: 7.5, isFinalized: true,
  },
  {
    rank: 3,
    team: {
      id: '3', name: 'WebWizards', status: 'SUBMITTED', createdAt: '2024-01-01',
      members: [
        { id: '6', name: 'Светлана Н.', email: 'sveta@example.com', role: 'PARTICIPANT' },
        { id: '7', name: 'Дмитрий К.', email: 'dima@example.com', role: 'PARTICIPANT' },
      ],
    },
    artifacts: {
      repoLink: 'github.com/webwizards/hack',
      repoCheck: { status: 'SUCCESS', score: 30 },
      docCheck: { status: 'PENDING' },
      presentationUrl: 'slides.pdf',
      presentationCheck: { status: 'SUCCESS', score: 9 },
      screencastCheck: { status: 'NOT_SUBMITTED' },
    },
    autoScore: 22, juryScores: [],
    avgJuryScore: 0, totalScore: 4.4, isFinalized: false,
  },
  {
    rank: 4,
    team: {
      id: '4', name: 'DataPunks', status: 'ACTIVE', createdAt: '2024-01-01',
      members: [
        { id: '8', name: 'Николай Д.', email: 'nikol@example.com', role: 'PARTICIPANT' },
      ],
    },
    artifacts: {
      repoCheck: { status: 'PENDING' },
      docCheck: { status: 'PENDING' },
      presentationCheck: { status: 'PENDING' },
      screencastCheck: { status: 'PENDING' },
    },
    autoScore: 0, juryScores: [],
    avgJuryScore: 0, totalScore: 0, isFinalized: false,
  },
];

// ─── Вспомогательные компоненты ──────────────────────────────

const CHECK_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-700',
  NOT_SUBMITTED: 'bg-gray-100 text-gray-500',
};
const CHECK_ICONS: Record<string, string> = {
  SUCCESS: '✅',
  FAILED: '❌',
  PENDING: '⏳',
  NOT_SUBMITTED: '—',
};

function CheckPill({ status }: { status: string }) {
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium ${CHECK_COLORS[status] ?? 'bg-gray-100'}`}>
      {CHECK_ICONS[status] ?? status}
    </span>
  );
}

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold w-8 text-right tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
}

// ─── Главный компонент ────────────────────────────────────────
type SortKey = 'rank' | 'totalScore' | 'autoScore' | 'avgJuryScore' | 'team';
type SortDir = 'asc' | 'desc';

export default function OrganizerBoard() {
  const { user, logout } = useAuthStore();
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CHECKED' | 'PENDING'>('ALL');

  // TODO: Замените мок на реальный API-вызов:
  // const [data, setData] = useState<LeaderboardEntry[]>([]);
  // useEffect(() => { leaderboardApi.get().then(setData); }, []);
  const data = MOCK_DATA;

  // Фильтрация
  const filtered = useMemo(() => {
    return data.filter(e => {
      const matchesSearch = e.team.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'CHECKED' && e.isFinalized) ||
        (filterStatus === 'PENDING' && !e.isFinalized);
      return matchesSearch && matchesStatus;
    });
  }, [data, search, filterStatus]);

  // Сортировка
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let diff = 0;
      if (sortKey === 'rank') diff = a.rank - b.rank;
      else if (sortKey === 'totalScore') diff = a.totalScore - b.totalScore;
      else if (sortKey === 'autoScore') diff = a.autoScore - b.autoScore;
      else if (sortKey === 'avgJuryScore') diff = a.avgJuryScore - b.avgJuryScore;
      else if (sortKey === 'team') diff = a.team.name.localeCompare(b.team.name);
      return sortDir === 'asc' ? diff : -diff;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir(key === 'rank' ? 'asc' : 'desc'); }
  };

  // Статистика
  const finalized = data.filter(e => e.isFinalized);
  const avgTotal = finalized.length
    ? finalized.reduce((s, e) => s + e.totalScore, 0) / finalized.length
    : 0;
  const leader = data[0];

  // Экспорт CSV (работает прямо в браузере, без бэкенда)
  const handleExportCSV = () => {
    const header = ['Место', 'Команда', 'Участники', 'Авто-баллы', 'Ср.жюри', 'Итого', 'Статус'];
    const rows = sorted.map(e => [
      e.rank,
      `"${e.team.name}"`,
      `"${e.team.members.map(m => m.name).join(', ')}"`,
      e.autoScore,
      e.avgJuryScore.toFixed(2),
      e.totalScore.toFixed(2),
      e.isFinalized ? 'Финал' : 'В процессе',
    ]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortArrow = ({ k }: { k: SortKey }) =>
    sortKey === k ? <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span> : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold">🏆 Панель организатора</h1>
          <p className="text-xs text-gray-400 mt-0.5">Чемпионат по продуктовому программированию Самарской области</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>Выйти</Button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Всего команд', value: data.length, color: 'text-blue-600', icon: '👥' },
            { label: 'Проверено', value: `${finalized.length} / ${data.length}`, color: 'text-green-600', icon: '✅' },
            { label: 'Средний балл', value: avgTotal.toFixed(2), color: 'text-purple-600', icon: '📊' },
            { label: 'Лидер', value: leader?.totalScore.toFixed(2) ?? '—', color: 'text-amber-600', icon: '🥇' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-5 pb-4">
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span>{s.icon}</span> {s.label}
                </p>
                <p className={`text-3xl font-bold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Таблица */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle>Таблица результатов</CardTitle>
              <div className="flex flex-wrap gap-2">
                {/* Поиск */}
                <input
                  className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Поиск команды..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {/* Фильтр */}
                <select
                  className="border rounded-md px-2 py-1.5 text-sm bg-white"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as any)}
                >
                  <option value="ALL">Все</option>
                  <option value="CHECKED">Финализированные</option>
                  <option value="PENDING">В процессе</option>
                </select>
                {/* Экспорт */}
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  ⬇ Экспорт CSV
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-gray-600">
                  <tr>
                    <Th sortKey="rank" currentSort={sortKey} onClick={() => handleSort('rank')}>
                      Место <SortArrow k="rank" />
                    </Th>
                    <Th sortKey="team" currentSort={sortKey} onClick={() => handleSort('team')}>
                      Команда <SortArrow k="team" />
                    </Th>
                    <th className="px-4 py-3 text-left font-medium">Участники</th>
                    <th className="px-4 py-3 text-left font-medium">Артефакты</th>
                    <Th sortKey="autoScore" currentSort={sortKey} onClick={() => handleSort('autoScore')}>
                      Авто <SortArrow k="autoScore" />
                    </Th>
                    <Th sortKey="avgJuryScore" currentSort={sortKey} onClick={() => handleSort('avgJuryScore')}>
                      Жюри <SortArrow k="avgJuryScore" />
                    </Th>
                    <Th sortKey="totalScore" currentSort={sortKey} onClick={() => handleSort('totalScore')}>
                      Итого <SortArrow k="totalScore" />
                    </Th>
                    <th className="px-4 py-3 text-left font-medium">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sorted.map(entry => (
                    <tr key={entry.team.id} className="hover:bg-gray-50 transition-colors">
                      {/* Место */}
                      <td className="px-4 py-3 text-center w-16">
                        <RankBadge rank={entry.rank} />
                      </td>
                      {/* Команда */}
                      <td className="px-4 py-3 font-semibold">{entry.team.name}</td>
                      {/* Участники */}
                      <td className="px-4 py-3 text-gray-500 max-w-[160px]">
                        <span className="truncate block">{entry.team.members.map(m => m.name).join(', ')}</span>
                        <span className="text-xs text-gray-400">{entry.team.members.length} чел.</span>
                      </td>
                      {/* Артефакты — иконки статуса автопроверок */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <CheckPill status={entry.artifacts.repoCheck.status} />
                          <CheckPill status={entry.artifacts.docCheck.status} />
                          <CheckPill status={entry.artifacts.presentationCheck.status} />
                          <CheckPill status={entry.artifacts.screencastCheck.status} />
                        </div>
                        <div className="flex gap-1 mt-0.5">
                          {['Код', 'Доки', 'Презент.', 'Скринкаст'].map(l => (
                            <span key={l} className="text-[10px] text-gray-400 w-[42px] text-center">{l}</span>
                          ))}
                        </div>
                      </td>
                      {/* Авто-баллы */}
                      <td className="px-4 py-3">
                        <ScoreBar value={(entry.autoScore / 40) * 10} />
                        <span className="text-xs text-gray-400">{entry.autoScore}/40</span>
                      </td>
                      {/* Оценка жюри */}
                      <td className="px-4 py-3">
                        {entry.juryScores.length > 0 ? (
                          <>
                            <ScoreBar value={entry.avgJuryScore} />
                            <span className="text-xs text-gray-400">{entry.juryScores.length} эксперта</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Не оценено</span>
                        )}
                      </td>
                      {/* Итоговый балл */}
                      <td className="px-4 py-3">
                        <span className={`text-xl font-bold tabular-nums ${
                          entry.totalScore >= 8 ? 'text-green-600' :
                          entry.totalScore >= 5 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {entry.totalScore.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 ml-0.5">/ 10</span>
                      </td>
                      {/* Статус */}
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            entry.isFinalized
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                          }
                        >
                          {entry.isFinalized ? '✅ Финал' : '⏳ В процессе'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sorted.length === 0 && (
                <p className="text-center text-gray-400 py-12">Команды не найдены</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Легенда */}
        <p className="text-xs text-gray-400 text-right">
          Авто = нормализованные баллы автопроверок (0–40 → 0–10) · Жюри = средняя экспертная оценка · Итого = взвешенная сумма по критериям ТЗ
        </p>
      </main>
    </div>
  );
}

// Маленький хелпер для заголовка таблицы с сортировкой
function Th({
  children,
  onClick,
  sortKey,
  currentSort,
}: {
  children: React.ReactNode;
  onClick: () => void;
  sortKey: SortKey;
  currentSort: SortKey;
}) {
  return (
    <th
      className={`px-4 py-3 text-left font-medium cursor-pointer select-none hover:text-gray-900 transition-colors ${sortKey === currentSort ? 'text-blue-600' : ''}`}
      onClick={onClick}
    >
      {children}
    </th>
  );
}
