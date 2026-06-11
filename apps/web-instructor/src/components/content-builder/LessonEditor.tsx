'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, Switch, Badge, Tabs, TabsList, TabsTrigger, TabsContent } from '@edutech/ui';
import { Save, Upload, Film } from 'lucide-react';
import type { Lecture } from '@edutech/types';
import { useUpdateLesson } from '@/hooks/useContentBuilder';
import { AttachmentList } from './AttachmentList';

interface LessonEditorProps {
  courseId: number | string;
  sectionId: number;
  lecture: Lecture;
  onClose: () => void;
}

export function LessonEditor({ courseId, sectionId, lecture, onClose }: LessonEditorProps) {
  const [title, setTitle] = useState(lecture.title);
  const [description, setDescription] = useState(lecture.description || '');
  const [externalVideoUrl, setExternalVideoUrl] = useState(lecture.externalVideoUrl || '');
  const [isFreePreview, setIsFreePreview] = useState(lecture.isFreePreview);
  const [isPublished, setIsPublished] = useState(lecture.isPublished);
  const updateLesson = useUpdateLesson();

  const handleSave = () => {
    updateLesson.mutate({
      courseId,
      sectionId,
      lectureId: lecture.id,
      dto: {
        title: title.trim(),
        description: description.trim() || undefined,
        externalVideoUrl: externalVideoUrl.trim() || undefined,
        isFreePreview,
        isPublished,
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">{title || 'Lesson Editor'}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{lecture.type}</Badge>
            {isFreePreview && <Badge variant="secondary">Free Preview</Badge>}
            {isPublished && <Badge>Published</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleSave} disabled={updateLesson.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateLesson.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ed-title">Title</Label>
              <Input
                id="ed-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lesson title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ed-desc">Description</Label>
              <Textarea
                id="ed-desc"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Lesson description"
                rows={4}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch id="ed-free" checked={isFreePreview} onCheckedChange={setIsFreePreview} />
                <Label htmlFor="ed-free" className="text-sm">Free Preview</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="ed-pub" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="ed-pub" className="text-sm">Published</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ed-video-url">External Video URL</Label>
              <div className="flex gap-2">
                <Input
                  id="ed-video-url"
                  value={externalVideoUrl}
                  onChange={(e) => setExternalVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="flex-1"
                />
              </div>
            </div>
            {lecture.videoUrl && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Film className="h-4 w-4" />
                  Current video
                </div>
                <video src={lecture.videoUrl} controls className="w-full rounded-md max-h-64" />
              </div>
            )}
            {lecture.muxPlaybackId && (
              <div className="rounded-lg border p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Mux Playback ID: <code className="text-xs">{lecture.muxPlaybackId}</code>
                </p>
              </div>
            )}
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Video upload is available through the dedicated upload component
              </p>
            </div>
          </TabsContent>

          <TabsContent value="attachments">
            <AttachmentList lectureId={lecture.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
