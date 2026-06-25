import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamsApi, scoresApi } from '@/services/api';
import type { Team } from '@/types';

// Критерии оценки
const CRITERIA = {
  completeness: { label: 'Полнота MVP', defaultWeight: 20 },
  autoChecksQuality: { label: 'Качество автопроверок', defaultWeight: 15 },
  algorithmicModule: { label: 'Алгоритмический модуль', defaultWeight: 10 },
  architectureQuality: { label: 'Архитектура и код', defaultWeight: 10 },
  ux: { label: 'UX/UI', defaultWeight: 10 },
  standWork: { label: 'Работоспособность стенда', defaultWeight: 10 },
  documentation: { label: 'Документация', defaultWeight: 7 },
  presentation: { label: 'Презентация и скринкаст', defaultWeight: 6 },
  innovation: { label: 'Инновационность', defaultWeight: 6 },
  oralDefense: { label: 'Очная защита', defaultWeight: 6 },
};

type CriteriaKey = keyof typeof CRITERIA;

export default function JuryPanel() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Веса 
  const [weights, setWeights] = useState<Record<CriteriaKey, number>>(() => {
    const saved = localStorage.getItem('jury_weights');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return Object.fromEntries(
      Object.entries(CRITERIA).map(([key, val]) => [key, val.defaultWeight])
    ) as Record<CriteriaKey, number>;
  });

  // Оценки по критериям для выбранной команды
  const [scores, setScores] = useState<Record<CriteriaKey, number>>(
    () => Object.fromEntries(Object.keys(CRITERIA).map(k => [k, 0])) as Record<CriteriaKey, number>
  );
  const [comment, setComment] = useState('');

  // Загрузка списка команд
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await teamsApi.list();
        const validData = Array.isArray(data) ? data : [];
        setTeams(validData);
        if (validData.length > 0) {
          setSelectedTeamId(validData[0].id);
          setSelectedTeam(validData[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки команд:', err);
      } finally {
        setLoadingTeams(false);
      }
    };
    loadTeams();
  }, []);

  // Обновление выбранной команды при изменении selectedTeamId
  useEffect(() => {
    const team = (teams || []).find(t => t.id === selectedTeamId);
    setSelectedTeam(team || null);
  }, [selectedTeamId, teams]);

  const saveWeights = () => {
    localStorage.setItem('jury_weights', JSON.stringify(weights));
    alert('Веса сохранены! Теперь они будут использоваться для всех команд.');
  };

  const calculateTotal = () => {
    let total = 0;
    for (const key of Object.keys(CRITERIA) as CriteriaKey[]) {
      const weight = weights[key] / 100;
      const normalizedScore = scores[key] / 10;
      total += normalizedScore * weight;
    }
    return (total * 10).toFixed(1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitEvaluation = async () => {
    if (!selectedTeamId) {
      alert('Выберите команду');
      return;
    }

    setIsSubmitting(true);
    try {
      const totalScore = parseFloat(calculateTotal());

      await scoresApi.submit(selectedTeamId, {
        completeness: scores.completeness,
        autoChecksQuality: scores.autoChecksQuality,
        algorithmicModule: scores.algorithmicModule,
        architectureQuality: scores.architectureQuality,
        ux: scores.ux,
        standWork: scores.standWork,
        documentation: scores.documentation,
        presentation: scores.presentation,
        innovation: scores.innovation,
        oralDefense: scores.oralDefense,
        comment: comment || '',
        total: totalScore
      } as any);

      alert(`Оценки для команды сохранены! Итоговый балл: ${totalScore}`);
    } catch (err: any) {
      alert(err.message || 'Ошибка при сохранении оценок');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingTeams) {
    return <div className="p-8 text-center">Загрузка списка команд...</div>;
  }

  if (!teams || teams.length === 0) {
    return <div className="p-8 text-center">Нет команд для оценки.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-3 gap-8">
    {/* Левая колонка: информация о команде */}
    <div className="col-span-2 space-y-6">
    <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold">Оценка команды</h1>
    <Link to="/leaderboard" className="text-blue-600 hover:underline text-sm font-medium">
    🏆 Таблица лидеров
    </Link>
    </div>

    {/* Выбор команды */}
    <Card>
    <CardHeader>
    <CardTitle>Выберите команду</CardTitle>
    </CardHeader>
    <CardContent>
    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
    <SelectTrigger>
    <SelectValue placeholder="Выберите команду" />
    </SelectTrigger>
    <SelectContent>
    {teams.map(team => (
      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
    ))}
    </SelectContent>
    </Select>
    </CardContent>
    </Card>

    {selectedTeam && (
      <>
      <Card>
      <CardHeader><CardTitle>Результаты автопроверки</CardTitle></CardHeader>
      <CardContent>
      <p className="text-sm text-gray-600">Здесь будут отображаться артефакты и баллы команды {selectedTeam.name}</p>
      </CardContent>
      </Card>

      <Card>
      <CardHeader><CardTitle>Скринкаст и саммари (AI)</CardTitle></CardHeader>
      <CardContent>
      <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
      <span className="text-gray-500">Видео-плеер</span>
      </div>
      <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
      Здесь появится транскрипция скринкаста команды.
      </p>
      </CardContent>
      </Card>
      </>
    )}
    </div>

    {/* Правая колонка: оценка + настройка весов */}
    <div className="space-y-6">
    <Card>
    <CardHeader><CardTitle>Экспертная оценка</CardTitle></CardHeader>
    <CardContent className="space-y-4">
    {Object.entries(CRITERIA).map(([key, { label }]) => (
      <div key={key}>
      <div className="flex justify-between text-sm mb-1">
      <span>{label} (вес {weights[key as CriteriaKey]}%)</span>
      <span>{scores[key as CriteriaKey]} / 10</span>
      </div>
      <Slider
      max={10}
      step={1}
      value={[scores[key as CriteriaKey]]}
      onValueChange={([v]) => setScores(prev => ({ ...prev, [key]: v }))}
      />
      </div>
    ))}
    <Textarea
    placeholder="Комментарий команде"
    rows={3}
    value={comment}
    onChange={e => setComment(e.target.value)}
    />
    <div className="text-right font-bold text-lg">
    Итоговый балл: {calculateTotal()} / 10
    </div>
    <Button onClick={submitEvaluation} className="w-full" disabled={isSubmitting}>
    {isSubmitting ? 'Сохранение...' : 'Сохранить оценки'}
    </Button>
    </CardContent>
    </Card>

    <Card>
    <CardHeader><CardTitle>Настройка весов критериев (единые)</CardTitle></CardHeader>
    <CardContent className="space-y-3">
    {Object.entries(CRITERIA).map(([key, { label }]) => (
      <div key={key} className="flex items-center gap-2">
      <span className="text-sm w-40">{label}</span>
      <Input
      type="number"
      value={weights[key as CriteriaKey]}
      onChange={e => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val)) val = 0;
        if (val < 0) val = 0;
        if (val > 100) val = 100;
        setWeights(prev => ({ ...prev, [key]: val }));
      }}
      className="w-20 text-sm"
      />
      <span>%</span>
      </div>
    ))}
    <Button onClick={saveWeights} variant="outline" size="sm" className="w-full">
    Сохранить веса
    </Button>
    </CardContent>
    </Card>
    </div>
    </div>
  );
}
