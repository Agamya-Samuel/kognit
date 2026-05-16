import Link from 'next/link';

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <Link href="/assignments" className="py-4 text-sm font-medium text-foreground">
              Assignments
            </Link>
            <Link href="/submissions" className="py-4 text-sm font-medium text-muted-foreground hover:text-foreground">
              My Submissions
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}