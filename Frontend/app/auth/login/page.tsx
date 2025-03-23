'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') {
      router.push('/admin');
    }else{
      router.push('/dashboard');
    }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <Leaf className="h-8 w-8 text-green-500 mr-2" />
          <h1 className="text-2xl font-bold">Login to EcoSmart</h1>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
            Login
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Dont have an account?{' '}
          <Link href="/auth/register" className="text-green-600 hover:text-green-700">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}