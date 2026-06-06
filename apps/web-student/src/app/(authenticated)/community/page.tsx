'use client';

import { useMyChannels, useCourseChannels } from '@/hooks/useChat';
import { Card, CardContent, Badge, Button, Input, Skeleton } from '@edutech/ui';
import { Hash, Users, MessageCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: myChannels, isLoading: loadingMyChannels } = useMyChannels();
  const { data: courseChannels, isLoading: loadingCourseChannels } = useCourseChannels(null);

  const filteredChannels = myChannels?.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Community</h1>
        <p className="text-muted-foreground mt-1">Connect with peers and instructors</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Your Channels
          </h2>
          {loadingMyChannels ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChannels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No channels found matching your search.' : 'You haven\'t joined any channels yet.'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/courses">Browse Courses to Join</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredChannels.map((channel) => (
                <Link key={channel.id} href={`/community/${channel.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Hash className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{channel.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {channel.memberCount ?? 0} members
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5" />
            All Channels
          </h2>
          {loadingCourseChannels ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !courseChannels || courseChannels.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Hash className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No channels available right now.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {courseChannels.map((channel) => (
                <Link key={channel.id} href={`/community/${channel.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer opacity-60 hover:opacity-100">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                          <Hash className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{channel.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                            {channel.type} channel
                          </p>
                        </div>
                        <Badge variant="secondary">
                          <Users className="h-3 w-3 mr-1" />
                          {channel.memberCount ?? 0}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
