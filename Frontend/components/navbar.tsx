'use client';

import { useEffect, useState } from 'react';
import { Leaf, LogIn, LogOut, User, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loginStatus = localStorage.getItem('token');
    setIsLoggedIn(loginStatus !== null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-500" />
            <span className="text-xl font-bold">EcoSmart</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/analyze">
              <Button variant="ghost">Analyze Product</Button>
            </Link>
            {isLoggedIn ? (
              <>
                {isAdmin ? (
                  <Link href="/admin">
                    <Button variant="ghost">
                      <BarChart className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="ghost">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}