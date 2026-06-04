// src/pages/Participant/Dashboard.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ParticipantDashboard() {
    const [repoLink, setRepoLink] = useState('');

    // Имитация статусов автопроверок
    const autoChecks = {
        code: { status: 'SUCCESS', text: 'Пройдено: Линтеры, Секреты не найдены, README есть' },
        docs: { status: 'PENDING', text: 'Анализ PDF...' },
        presentation: { status: 'FAILED', text: 'Ошибка: Найдено менее 8 слайдов' },
    };

    const handleUploadRepo = () => {
        // API call: axios.post('/api/artifacts/repo', { link: repoLink })
        alert('Репозиторий отправлен на автопроверку!');
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Личный кабинет команды</h1>

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
                        <Button onClick={handleUploadRepo} className="w-full">
                            Отправить на автопроверку
                        </Button>
                        {autoChecks.code.status === 'SUCCESS' && (
                            <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                {autoChecks.code.text}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Загрузка Документации */}
                <Card>
                    <CardHeader>
                        <CardTitle>Документация (PDF/MD)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input type="file" accept=".pdf,.md,.docx" />
                        <Button variant="outline" className="w-full">Загрузить файл</Button>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            Статус: {autoChecks.docs.status}
                        </Badge>
                    </CardContent>
                </Card>

                {/* Загрузка Презентации */}
                <Card>
                    <CardHeader>
                        <CardTitle>Презентация (Demo-day)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input type="file" accept=".pptx,.pdf" />
                        <Button variant="outline" className="w-full">Загрузить презентацию</Button>
                        {autoChecks.presentation.status === 'FAILED' && (
                            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                {autoChecks.presentation.text}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Алгоритмический модуль */}
                <Card>
                    <CardHeader>
                        <CardTitle>Алгоритмическая задача (Sandbox)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full">
                            {"Перейти к решению задач ->"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
