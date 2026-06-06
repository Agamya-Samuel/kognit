'use client';

import { useState } from 'react';
import { type SectionWithLectures } from '@edutech/types';

interface CurriculumAccordionProps {
  sections: SectionWithLectures[];
}

export function CurriculumAccordion({ sections }: CurriculumAccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getLectureIcon = (type: SectionWithLectures['lectures'][0]['type']) => {
    switch (type) {
      case 'video':
        return '🎬';
      case 'live':
        return '📡';
      case 'text':
        return '📝';
      case 'assignment':
        return '📋';
      case 'quiz':
        return '❓';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className="overflow-hidden rounded-lg border bg-card"
        >
          <button
            onClick={() => toggleSection(section.id)}
            className="flex w-full items-center justify-between border-b bg-muted/50 px-4 py-4 text-left transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-muted-foreground transition-transform ${
                  expandedSections.has(section.id) ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>
              <span className="font-semibold">{section.title}</span>
              <span className="text-sm text-muted-foreground">
                {section.lectures.length} lectures
              </span>
            </div>
          </button>

          {expandedSections.has(section.id) && (
            <div className="divide-y">
              {section.lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50"
                >
                  <span className="text-lg">{getLectureIcon(lecture.type)}</span>
                  <div className="flex-1">
                    <h4 className="font-medium">{lecture.title}</h4>
                    {lecture.description && (
                      <p className="text-sm text-muted-foreground">
                        {lecture.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {lecture.isFreePreview && (
                      <span className="rounded-full bg-[hsl(var(--success))] px-2 py-0.5 text-xs font-medium text-white">
                        Free Preview
                      </span>
                    )}
                    {lecture.durationSeconds > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(lecture.durationSeconds)}
                      </span>
                    )}
                    {!lecture.isFreePreview && (
                      <span className="text-muted-foreground" title="Enroll to access">
                        🔒
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
