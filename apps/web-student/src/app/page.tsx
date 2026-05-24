import { Button } from '@edutech/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Welcome to EduTech</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Discover amazing courses and start learning today
        </p>
        <Link href="/dashboard">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  );
}