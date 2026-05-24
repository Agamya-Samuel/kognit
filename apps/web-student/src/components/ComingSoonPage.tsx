'use client';

'use client';

import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@edutech/ui';
import { ArrowRight, Calendar, Sparkles } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description?: string;
  showEmailSignup?: boolean;
}

export function ComingSoonPage({ title, description, showEmailSignup = false }: ComingSoonPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">{title}</CardTitle>
            <p className="text-muted-foreground">
              {description || 'This feature is coming soon. We\'re working hard to bring you an amazing experience!'}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Coming Q2 2026</span>
              </div>
            </div>

            {showEmailSignup && (
              <div className="space-y-4">
                <Label htmlFor="email">Get notified when it launches</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                  <Button type="button" className="gap-2">
                    Notify Me
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center">
              <Button variant="ghost" asChild>
                <a href="/dashboard">
                  Return to Dashboard
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}