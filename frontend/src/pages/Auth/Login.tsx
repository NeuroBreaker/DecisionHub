import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

    const handleLogin = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        try {
            await login(email, password);
            navigate('/jury');
        } catch (err) {
            setError('Ошибка входа: проверьте данные');
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="w-full max-w-sm">
        <Card>
          <CardHeader><CardTitle>Вход в систему</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Пароль</Label>
              <Input type="password" onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Войти</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
