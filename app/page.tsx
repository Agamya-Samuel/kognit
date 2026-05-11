'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login/dashboard based on auth state
    router.replace('/auth/login');
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to EduTech</h1>
        <p className="text-muted-foreground mb-8">Redirecting...</p>
      </div>
    </main>
  );
}
