// src/pages/Participant/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { artifactsApi } from '@/services/api';
import type { Artifacts } from '@/types';

export default function ParticipantDashboard() {
    const { user } = useAuthStore();
    const teamId = (user as any)?.teamId ?? (user as any)?.teamname ?? null;

    const [repoLink, setRepoLink] = useState('');
    const [screencastUrl, setScreencastUrl] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const [presFile, setPresFile] = useState<File | null>(null);

    const [loadingRepo, setLoadingRepo] = useState(false);
    const [loadingDoc, setLoadingDoc] = useState(false);
    const [loadingPres, setLoadingPres] = useState(false);
    const [loadingScreencast, setLoadingScreencast] = useState(false);

    const [artifacts, setArtifacts] = useState<Artifacts | null>(null);

    const loadArtifacts = async () => {
        if (!teamId) return;
        try {
            const data = await artifactsApi.getByTeam(teamId);
            const adapted: Artifacts = {
                repoLink: undefined,
                repoCheck: {
                    status: (data.github_score ?? 0) > 0 ? 'SUCCESS' : 'NOT_SUBMITTED',
                    score: data.github_score ?? 0,
                    message: (data.github_score ?? 0) > 0 ? `Оценка: ${data.github_score}` : 'Репозиторий не загружен'
                },
                documentationUrl: undefined,
                docCheck: {
                    status: (data.doc_score ?? 0) > 0 ? 'SUCCESS' : 'NOT_SUBMITTED',
                    score: data.doc_score ?? 0,
                    message: (data.doc_score ?? 0) > 0 ? `Оценка: ${data.doc_score}` : 'Документация не загружена'
                },
                presentationUrl: undefined,
                presentationCheck: {
                    status: (data.present_score ?? 0) > 0 ? 'SUCCESS' : 'NOT_SUBMITTED',
                    score: data.present_score ?? 0,
                    message: (data.present_score ?? 0) > 0 ? `Оценка: ${data.present_score}` : 'Презентация не загружена'
                },
                screencastUrl: undefined,
                screencastCheck: {
                    status: (data.video_score ?? 0) > 0 ? 'SUCCESS' : 'NOT_SUBMITTED',
                    score: data.video_score ?? 0,
                    message: (data.video_score ?? 0) > 0 ? `Оценка: ${data.video_score}` : 'Скринкаст не загружен'
                }
            };
            setArtifacts(adapted);
        } catch (err) {
            console.error('Ошибка загрузки артефактов:', err);
        }
    };

    useEffect(() => {
        if (teamId) loadArtifacts();
    }, [teamId]);

        const getCheckStatus = (check: any) => {
            if (!check) return { status: 'NOT_SUBMITTED', text: '— Не отправлено', color: 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50' };
            const statusMap: Record<string, { text: string; color: string }> = {
                SUCCESS: { text: '✅ Успешно проверено', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
                FAILED: { text: '❌ Ошибка проверки', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
                PENDING: { text: '⏳ Проверяется...', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
                NOT_SUBMITTED: { text: '— Не отправлено', color: 'bg-zinc-800/50 text-zinc-400 border border-zinc-700/50' },
            };
            return statusMap[check.status] || statusMap.NOT_SUBMITTED;
        };

        const handleUploadRepo = async () => {
            if (!repoLink) return alert('Введите ссылку на репозиторий');
            if (!teamId) return alert('Команда не найдена.');
            setLoadingRepo(true);
            try {
                await artifactsApi.submitRepo(teamId, repoLink);
                alert('Репозиторий отправлен на автопроверку!');
                await loadArtifacts();
                setRepoLink('');
            } catch (err: any) {
                alert(err.message || 'Ошибка при отправке репозитория');
            } finally {
                setLoadingRepo(false);
            }
        };

        const handleUploadDoc = async () => {
            if (!docFile) return alert('Выберите файл документации');
            if (!teamId) return alert('Команда не найдена');
            setLoadingDoc(true);
            try {
                await artifactsApi.uploadDoc(teamId, docFile);
                alert('Документация загружена, начата проверка');
                await loadArtifacts();
                setDocFile(null);
            } catch (err: any) {
                alert(err.message || 'Ошибка загрузки документации');
            } finally {
                setLoadingDoc(false);
            }
        };

        const handleUploadPresentation = async () => {
            if (!presFile) return alert('Выберите файл презентации');
            if (!teamId) return alert('Команда не найдена');
            setLoadingPres(true);
            try {
                await artifactsApi.uploadPresentation(teamId, presFile);
                alert('Презентация загружена, начата проверка');
                await loadArtifacts();
                setPresFile(null);
            } catch (err: any) {
                alert(err.message || 'Ошибка загрузки презентации');
            } finally {
                setLoadingPres(false);
            }
        };

        const handleSubmitScreencast = async () => {
            if (!screencastUrl) return alert('Введите ссылку на скринкаст');
            if (!teamId) return alert('Команда не найдена');
            setLoadingScreencast(true);
            try {
                await artifactsApi.submitScreencast(teamId, screencastUrl);
                alert('Ссылка на скринкаст сохранена');
                await loadArtifacts();
                setScreencastUrl('');
            } catch (err: any) {
                alert(err.message || 'Ошибка сохранения скринкаста');
            } finally {
                setLoadingScreencast(false);
            }
        };

        if (!teamId) {
            return (
                <div className="p-8 text-center min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center">
                <h2 className="text-xl font-bold text-amber-500">Команда не привязана</h2>
                <p className="mt-2 text-zinc-400">Пожалуйста, обратитесь к организатору для привязки к команде.</p>
                </div>
            );
        }

        const repoStatus = artifacts?.repoCheck || { status: 'NOT_SUBMITTED' };
        const docStatus = artifacts?.docCheck || { status: 'NOT_SUBMITTED' };
        const presStatus = artifacts?.presentationCheck || { status: 'NOT_SUBMITTED' };
        const screencastStatus = artifacts?.screencastCheck || { status: 'NOT_SUBMITTED' };

        return (
            <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Личный кабинет команды
            </h1>
            <Link to="/leaderboard" className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold flex items-center gap-1">
            🏆 Таблица лидеров
            </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. Исходный код решения (Git) */}
            <Card className="bg-zinc-900/40 border-zinc-800 text-zinc-100">
            <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
            <span className="text-xl">💻</span>
            <CardTitle className="text-lg">Исходный код решения (Git)</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <Input
            placeholder="https://github.com/ваша-команда/проект"
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus-visible:ring-zinc-700"
            />
            <Button onClick={handleUploadRepo} className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200" disabled={loadingRepo}>
            {loadingRepo ? 'Отправка...' : 'Отправить на автопроверку'}
            </Button>
            <div className={`text-xs p-3 rounded-lg border flex flex-col gap-0.5 ${getCheckStatus(repoStatus).color}`}>
            <span className="font-semibold">{getCheckStatus(repoStatus).text}</span>
            {repoStatus.message && <span className="opacity-80">({repoStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* 2. Документация (PDF/MD) */}
            <Card className="bg-zinc-900/40 border-zinc-800 text-zinc-100">
            <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <CardTitle className="text-lg">Документация (PDF/MD/DOCX)</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg className="w-8 h-8 mb-2 text-zinc-500" fill="none" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="text-sm text-zinc-300 font-medium">Кликните для выбора файла</p>
            <p className="text-xs text-zinc-500 mt-1 truncate max-w-xs">
            {docFile ? `Выбран: ${docFile.name}` : "PDF, MD, DOCX (макс. 10MB)"}
            </p>
            </div>
            <input
            type="file"
            accept=".pdf,.md,.docx"
            className="hidden"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            />
            </label>
            </div>
            <Button onClick={handleUploadDoc} variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" disabled={loadingDoc || !docFile}>
            {loadingDoc ? 'Загрузка...' : 'Загрузить документацию'}
            </Button>
            <div className={`text-xs p-3 rounded-lg border flex flex-col gap-0.5 ${getCheckStatus(docStatus).color}`}>
            <span className="font-semibold">{getCheckStatus(docStatus).text}</span>
            {docStatus.message && <span className="opacity-80">({docStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* 3. Презентация (Demo-day) */}
            <Card className="bg-zinc-900/40 border-zinc-800 text-zinc-100">
            <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <CardTitle className="text-lg">Презентация (Demo-day)</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-900/60 border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            <svg className="w-8 h-8 mb-2 text-zinc-500" fill="none" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="text-sm text-zinc-300 font-medium">Кликните для выбора слайдов</p>
            <p className="text-xs text-zinc-500 mt-1 truncate max-w-xs">
            {presFile ? `Выбран: ${presFile.name}` : "PPTX, PDF (макс. 20MB)"}
            </p>
            </div>
            <input
            type="file"
            accept=".pptx,.pdf"
            className="hidden"
            onChange={(e) => setPresFile(e.target.files?.[0] || null)}
            />
            </label>
            </div>
            <Button onClick={handleUploadPresentation} variant="outline" className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" disabled={loadingPres || !presFile}>
            {loadingPres ? 'Загрузка...' : 'Загрузить презентацию'}
            </Button>
            <div className={`text-xs p-3 rounded-lg border flex flex-col gap-0.5 ${getCheckStatus(presStatus).color}`}>
            <span className="font-semibold">{getCheckStatus(presStatus).text}</span>
            {presStatus.message && <span className="opacity-80">({presStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* 4. Скринкаст (видео) */}
            <Card className="bg-zinc-900/40 border-zinc-800 text-zinc-100">
            <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
            <span className="text-xl">🎬</span>
            <CardTitle className="text-lg">Скринкаст (видео-демо)</CardTitle>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <Input
            placeholder="Ссылка на VK Видео / YouTube / Vimeo"
            value={screencastUrl}
            onChange={(e) => setScreencastUrl(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus-visible:ring-zinc-700"
            />
            <Button onClick={handleSubmitScreencast} variant="secondary" className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700" disabled={loadingScreencast}>
            {loadingScreencast ? 'Сохранение...' : 'Сохранить ссылку'}
            </Button>
            <div className={`text-xs p-3 rounded-lg border flex flex-col gap-0.5 ${getCheckStatus(screencastStatus).color}`}>
            <span className="font-semibold">{getCheckStatus(screencastStatus).text}</span>
            {screencastStatus.message && <span className="opacity-80">({screencastStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* 5. Алгоритмический модуль */}
            <Card className="bg-zinc-900/40 border-zinc-800 text-zinc-100 md:col-span-2">
            <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <CardTitle className="text-lg">Алгоритмическая задача (Sandbox)</CardTitle>
            </div>
            </CardHeader>
            <CardContent>
            <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850" onClick={() => alert('Функция в разработке')}>
            Перейти к автоматическому тестированию задач →
            </Button>
            </CardContent>
            </Card>

            </div>
            </div>
            </div>
        );
}
