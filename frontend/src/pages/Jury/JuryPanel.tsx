// src/pages/Jury/JuryPanel.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider'; // Ползунок для оценок
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function JuryPanel() {
  const [scores, setScores] = useState({ mvp: 0, ui: 0, innovation: 0 });
  const [comment, setComment] = useState('');

  // Имитация данных команды (пришли с бэкенда)
  const teamData = {
    name: "CyberSamara",
    autoScore: 35, // Баллы от автопроверки кода/документов
    aiSummary: "Команда разработала веб-приложение на React. В видео продемонстрирован полный флоу пользователя...",
    links: { repo: "github.com/...", video: "youtube.com/..." }
  };

  const submitEvaluation = () => {
    // API call для отправки оценок
    console.log("Оценки отправлены", scores, comment);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto grid grid-cols-3 gap-8">
      {/* Левая колонка: Информация об артефактах (2/3 ширины) */}
      <div className="col-span-2 space-y-6">
        <h1 className="text-3xl font-bold">Оценка: {teamData.name}</h1>
        
        <Card>
          <CardHeader><CardTitle>Результаты Автопроверки</CardTitle></CardHeader>
          <CardContent className="flex gap-4">
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg w-1/3 text-center">
              <span className="block text-2xl font-bold">{teamData.autoScore} / 40</span>
              <span className="text-sm">Авто-баллы</span>
            </div>
            <div className="text-sm space-y-1">
              <p>✅ Код: Линтеры пройдены (LOC: 3400)</p>
              <p>✅ Презентация: 12 слайдов (Структура валидна)</p>
              <p>✅ Sandbox: 3/3 задач решены (OK)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Скринкаст и Саммари (AI)</CardTitle></CardHeader>
          <CardContent>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center mb-4">
               {/* Здесь будет <video> или <iframe> */}
               <span className="text-gray-500">Video Player</span>
            </div>
            <h4 className="font-semibold mb-2">Автоматическая транскрипция:</h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
              {teamData.aiSummary}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Правая колонка: Форма экспертной оценки (1/3 ширины) */}
      <div className="space-y-6">
        <Card className="sticky top-8">
          <CardHeader><CardTitle>Экспертная оценка</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            
            {/* Критерий 1 */}
            <div>
              <label className="flex justify-between text-sm font-medium mb-2">
                <span>UI/UX и удобство</span>
                <span>{scores.ui} / 10</span>
              </label>
              <Slider 
                max={10} step={1} 
                onValueChange={(val) => setScores({...scores, ui: val[0]})} 
              />
            </div>

            {/* Критерий 2 */}
            <div>
              <label className="flex justify-between text-sm font-medium mb-2">
                <span>Инновационность</span>
                <span>{scores.innovation} / 10</span>
              </label>
              <Slider 
                max={10} step={1} 
                onValueChange={(val) => setScores({...scores, innovation: val[0]})} 
              />
            </div>

            {/* Комментарий */}
            <div>
              <label className="text-sm font-medium mb-2 block">Комментарий команде</label>
              <Textarea 
                placeholder="Сильные/слабые стороны..." 
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <Button onClick={submitEvaluation} className="w-full bg-blue-600 hover:bg-blue-700">
              Сохранить оценки
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
