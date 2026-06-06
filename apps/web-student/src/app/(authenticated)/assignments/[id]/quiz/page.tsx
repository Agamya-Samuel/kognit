'use client';

import { useState, useEffect } from 'react';
import { useAssignment } from '@/hooks/useAssignments';
import { useQuizQuestions } from '@/hooks/useQuiz';
import { useSubmitAssignment } from '@/hooks/useSubmissions';
import { QuizQuestionItem } from '@/components/QuizQuestion';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';

export default function QuizPage({ params }: { params: { id: string } }) {
  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(params.id);
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuizQuestions(Number(params.id));
  const { submit, isLoading: isSubmitting } = useSubmitAssignment();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (hasStarted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => (prev ?? 0) - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [hasStarted, timeLeft]);

  const handleStart = () => {
    setHasStarted(true);
    setTimeLeft((questions?.length ?? 0) * 60); // 1 minute per question
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    if (!hasStarted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!questions) return;
    const answers = questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[idx] ?? -1,
    }));
    const result = await submit(Number(params.id), JSON.stringify(answers));
    if (result.success) {
      alert('Quiz submitted successfully!');
      window.location.href = `/assignments/${params.id}`;
    } else {
      alert(result.error || 'Failed to submit quiz');
    }
  };

  const allAnswered = questions?.every((_, idx) => selectedAnswers[idx] !== undefined) ?? false;

  if (assignmentLoading || questionsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-8 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
          <div className="h-40 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (assignmentError || questionsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <ErrorState message={(assignmentError?.message || questionsError?.message || 'Failed to load quiz')} />
        </div>
      </div>
    );
  }

  if (!assignment || !questions || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            title="Quiz not found"
            description="This quiz may have been removed or doesn't exist."
            icon={<span className="text-6xl">📝</span>}
          />
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-8">
          <h1 className="mb-4 text-3xl font-bold">{assignment.title}</h1>
          <div className="mb-6 space-y-2">
            <p className="text-muted-foreground">{assignment.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <span>📝</span>
                <span>{questions.length} questions</span>
              </span>
              <span className="flex items-center gap-1">
                <span>⭐</span>
                <span>{assignment.maxScore} points</span>
              </span>
            </div>
          </div>
          <div className="rounded-md bg-muted p-4 mb-6">
            <h3 className="mb-2 font-semibold text-sm">Quiz Instructions</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Once started, you cannot pause the quiz</li>
              <li>Each question has {questions.reduce((acc, q) => acc + q.points, 0) / questions.length} points</li>
              <li>Time limit: {questions.length * 60} seconds (1 minute per question)</li>
              <li>You can navigate between questions but cannot change answers after submission</li>
            </ul>
          </div>
          <button
            onClick={handleStart}
            className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 sticky top-4 z-10 rounded-lg border bg-card p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{assignment.title}</h1>
              <p className="text-sm text-muted-foreground">
                Questions: {questions.length} | Total Points: {assignment.maxScore}
              </p>
            </div>
            <div className={`rounded-full px-4 py-2 font-mono text-lg font-bold ${timeLeft! < 60 ? 'text-red-600' : 'text-foreground'}`}>
              {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-6">
          {questions.map((question, idx) => (
            <QuizQuestionItem
              key={question.id}
              question={question}
              questionNumber={idx + 1}
              selectedOption={selectedAnswers[idx] ?? null}
              onOptionSelect={(optionIndex) => handleAnswerSelect(idx, optionIndex)}
            />
          ))}
        </div>

        <div className="sticky bottom-4 rounded-lg border bg-card p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Answered: {Object.keys(selectedAnswers).length}/{questions.length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}