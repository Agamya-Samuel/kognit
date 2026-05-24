'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useCourseWithCurriculum } from '@/hooks/useCourseDetail';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { VideoPlayer } from '@edutech/shared-components';
import { usePlaybackUrl } from '@edutech/shared-components';

export default function LectureWatchPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const lectureId = parseInt(params.lectureId as string, 10);

  const { data: course, isLoading: courseLoading } = useCourseWithCurriculum(courseId);

  // Playback URL hook
  const {
    playbackUrl,
    status: videoStatus,
    isLoading: videoLoading,
    error: videoError,
    videoStatus: videoInfo,
  } = usePlaybackUrl({ lectureId, autoFetch: true });

  // Progress tracking
  const {
    progress,
    isLoading: progressLoading,
    reportProgress,
    updateError,
  } = useProgressTracking({
    lectureId,
    enabled: !!lectureId,
  });

  // Build flat lecture list for navigation
  const flatLectures = useMemo(() => {
    if (!course?.sections) return [];
    return course.sections.flatMap((section) =>
      section.lectures
        .filter((l) => l.isPublished)
        .map((l) => ({ ...l, sectionTitle: section.title })),
    );
  }, [course]);

  const currentLectureIndex = flatLectures.findIndex((l) => l.id === lectureId);
  const currentLecture = flatLectures[currentLectureIndex];
  const prevLecture = currentLectureIndex > 0 ? flatLectures[currentLectureIndex - 1] : null;
  const nextLecture =
    currentLectureIndex < flatLectures.length - 1 ? flatLectures[currentLectureIndex + 1] : null;

  const duration = videoInfo?.duration ?? currentLecture?.durationSeconds ?? 0;
  const resumePosition = progress?.watchedSeconds ?? 0;

  const handleTimeUpdate = (currentTime: number) => {
    reportProgress(Math.floor(currentTime));
  };

  const handleEnded = () => {
    reportProgress(duration);
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (courseLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="w-full h-full border-4 border-blue-500/30 rounded-full">
              <div className="w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
            </div>
          </div>
          <p>Loading lecture...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Course not found</p>
          <button
            onClick={() => router.push('/courses')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back to Course</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-sm font-medium truncate">
              {course.title}
            </h1>
          </div>
          {progress?.isCompleted && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <CheckCircle size={16} />
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="lg:flex">
          {/* Video Player Area */}
          <div className="lg:flex-1">
            <div className="aspect-video bg-black">
              <VideoPlayer
                playbackUrl={playbackUrl ?? ''}
                duration={duration}
                status={videoLoading ? 'preparing' : videoError ? 'errored' : (videoStatus === 'none' ? 'preparing' : (videoStatus ?? 'preparing'))}
                errorMessage={videoError ?? undefined}
                resumePosition={resumePosition}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                autoplay={false}
              />
            </div>

            {/* Lecture Info & Navigation */}
            <div className="p-4 lg:p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {currentLecture && (
                    <p className="text-gray-400 text-xs mb-1">
                      {currentLecture.sectionTitle}
                    </p>
                  )}
                  <h2 className="text-white text-xl font-bold">
                    {currentLecture?.title ?? 'Lecture'}
                  </h2>
                  {duration > 0 && (
                    <p className="text-gray-400 text-sm mt-1">
                      Duration: {formatDuration(duration)}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {progress && progress.progressPercentage > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{progress.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress.isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {updateError && (
                <p className="text-red-400 text-xs mb-2">Failed to save progress: {updateError}</p>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <button
                  onClick={() =>
                    prevLecture && router.push(`/courses/${courseId}/lectures/${prevLecture.id}`)
                  }
                  disabled={!prevLecture}
                  className="flex items-center gap-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                  <span className="text-sm">Previous</span>
                </button>
                <span className="text-gray-500 text-xs">
                  {currentLectureIndex + 1} / {flatLectures.length}
                </span>
                <button
                  onClick={() =>
                    nextLecture && router.push(`/courses/${courseId}/lectures/${nextLecture.id}`)
                  }
                  disabled={!nextLecture}
                  className="flex items-center gap-2 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Lecture List */}
          <div className="lg:w-80 xl:w-96 border-l border-gray-800 bg-gray-900/50 max-h-screen overflow-y-auto">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold text-sm">Course Content</h3>
              <p className="text-gray-400 text-xs mt-1">
                {flatLectures.length} lectures
              </p>
            </div>
            <div className="divide-y divide-gray-800">
              {flatLectures.map((lecture, idx) => {
                const isActive = lecture.id === lectureId;
                const isDone =
                  idx < currentLectureIndex || (isActive && progress?.isCompleted);

                return (
                  <button
                    key={lecture.id}
                    onClick={() =>
                      router.push(`/courses/${courseId}/lectures/${lecture.id}`)
                    }
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      isActive
                        ? 'bg-blue-600/10 border-l-2 border-blue-500'
                        : 'hover:bg-gray-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isDone ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <span className="block w-4 h-4 rounded-full border border-gray-600 text-[10px] text-gray-400 flex items-center justify-center leading-none">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? 'text-blue-400' : 'text-white'
                        }`}
                      >
                        {lecture.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDuration(lecture.durationSeconds)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
