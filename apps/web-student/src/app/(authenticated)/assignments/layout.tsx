'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@edutech/ui';

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Tabs defaultValue="assignments" className="w-full">
        <TabsList>
          <TabsTrigger value="assignments" asChild>
            <Link href="/assignments">Assignments</Link>
          </TabsTrigger>
          <TabsTrigger value="submissions" asChild>
            <Link href="/submissions">My Submissions</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}