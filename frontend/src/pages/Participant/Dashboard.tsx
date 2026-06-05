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
            if (!check) return { status: 'NOT_SUBMITTED', text: 'Не отправлено', color: 'bg-gray-100 text-gray-500' };
            const statusMap: Record<string, { text: string; color: string }> = {
                SUCCESS: { text: '✅ Успешно', color: 'bg-green-100 text-green-800' },
                FAILED: { text: '❌ Ошибка', color: 'bg-red-100 text-red-800' },
                PENDING: { text: '⏳ Проверяется', color: 'bg-yellow-100 text-yellow-700' },
                NOT_SUBMITTED: { text: '— Не отправлено', color: 'bg-gray-100 text-gray-500' },
            };
            return statusMap[check.status] || statusMap.NOT_SUBMITTED;
        };

        const handleUploadRepo = async () => {
            if (!repoLink) return alert('Введите ссылку на репозиторий');
            if (!teamId) return alert('Команда не найдена. Сначала создайте или вступите в команду.');
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
                const fileInput = document.getElementById('doc-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
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
                const fileInput = document.getElementById('pres-file') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
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

        // Заменённый блок проверки teamId
        if (!teamId) {
            console.warn('teamId отсутствует, используем заглушку "temp"');
            return (
                <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-yellow-600">Команда не привязана</h2>
                <p className="mt-2">Функциональность временно ограничена. Пожалуйста, создайте команду через панель организатора.</p>
                </div>
            );
        }

        const repoStatus = artifacts?.repoCheck || { status: 'NOT_SUBMITTED' };
        const docStatus = artifacts?.docCheck || { status: 'NOT_SUBMITTED' };
        const presStatus = artifacts?.presentationCheck || { status: 'NOT_SUBMITTED' };
        const screencastStatus = artifacts?.screencastCheck || { status: 'NOT_SUBMITTED' };

        return (
            <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Личный кабинет команды</h1>
            <Link to="/leaderboard" className="text-blue-600 hover:underline text-sm font-medium">
            🏆 Таблица лидеров
            </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Загрузка Репозитория */}
            <Card>
            <CardHeader>
            <CardTitle>Исходный код решения (Git)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <Input
            placeholder="https://github.com/ваша-команда/проект"
            value={repoLink}
            onChange={(e) => setRepoLink(e.target.value)}
            />
            <Button onClick={handleUploadRepo} className="w-full" disabled={loadingRepo}>
            {loadingRepo ? 'Отправка...' : 'Отправить на автопроверку'}
            </Button>
            <div className={`text-sm p-2 rounded ${getCheckStatus(repoStatus).color}`}>
            {getCheckStatus(repoStatus).text}
            {repoStatus.message && <span className="block text-xs">({repoStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* Загрузка Документации */}
            <Card>
            <CardHeader>
            <CardTitle>Документация (PDF/MD)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <input
            id="doc-file"
            type="file"
            accept=".pdf,.md,.docx"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUploadDoc} variant="outline" className="w-full" disabled={loadingDoc}>
            {loadingDoc ? 'Загрузка...' : 'Загрузить файл'}
            </Button>
            <Badge variant="outline" className={`${getCheckStatus(docStatus).color} border-none`}>
            Статус: {getCheckStatus(docStatus).text}
            </Badge>
            </CardContent>
            </Card>

            {/* Загрузка Презентации */}
            <Card>
            <CardHeader>
            <CardTitle>Презентация (Demo-day)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <input
            id="pres-file"
            type="file"
            accept=".pptx,.pdf"
            onChange={(e) => setPresFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleUploadPresentation} variant="outline" className="w-full" disabled={loadingPres}>
            {loadingPres ? 'Загрузка...' : 'Загрузить презентацию'}
            </Button>
            <div className={`text-sm p-2 rounded ${getCheckStatus(presStatus).color}`}>
            {getCheckStatus(presStatus).text}
            {presStatus.message && <span className="block text-xs">({presStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* Скринкаст */}
            <Card>
            <CardHeader>
            <CardTitle>Скринкаст (видео)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <Input
            placeholder="Ссылка на YouTube/Vimeo"
            value={screencastUrl}
            onChange={(e) => setScreencastUrl(e.target.value)}
            />
            <Button onClick={handleSubmitScreencast} variant="secondary" className="w-full" disabled={loadingScreencast}>
            {loadingScreencast ? 'Сохранение...' : 'Сохранить ссылку'}
            </Button>
            <div className={`text-sm p-2 rounded ${getCheckStatus(screencastStatus).color}`}>
            {getCheckStatus(screencastStatus).text}
            {screencastStatus.message && <span className="block text-xs">({screencastStatus.message})</span>}
            </div>
            </CardContent>
            </Card>

            {/* Алгоритмический модуль – заглушка */}
            <Card>
            <CardHeader>
            <CardTitle>Алгоритмическая задача (Sandbox)</CardTitle>
            </CardHeader>
            <CardContent>
            <Button variant="secondary" className="w-full" onClick={() => alert('Функция в разработке')}>
            Перейти к решению задач →
            </Button>
            </CardContent>
            </Card>
            </div>
            </div>
        );
}
