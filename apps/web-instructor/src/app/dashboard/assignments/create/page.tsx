'use client';

import { useState } from 'react';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useMyCourses } from '@/hooks/useCourses';
import { toast } from 'sonner';
import { Spinner } from '@edutech/ui';

type Step = 'details' | 'questions' | 'review';

export default function CreateAssignmentPage() {
  const createAssignment = useCreateAssignment();
  const { data: courses, isLoading: coursesLoading } = useMyCourses();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [assignmentData, setAssignmentData] = useState({
    lectureId: 0,
    title: '',
    description: '',
    type: 'short' as 'mcq' | 'short' | 'code',
    maxScore: 100,
    dueAt: '',
    lateWindowHours: 0,
    latePenaltyPercent: 0,
  });
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<
    Array<{ questionText: string; options: string[]; correctOptionIndex: number; points: number }>
  >([]);

  const handleNext = () => {
    if (currentStep === 'details') setCurrentStep('questions');
    else if (currentStep === 'questions') setCurrentStep('review');
  };

  const handleBack = () => {
    if (currentStep === 'review') setCurrentStep('questions');
    else if (currentStep === 'questions') setCurrentStep('details');
  };

  const handleSubmit = async () => {
    try {
      await createAssignment.mutateAsync(assignmentData);
      toast.success('Assignment created successfully!');
    } catch (error) {
      toast.error('Failed to create assignment');
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 10 },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const isDetailsValid = assignmentData.title && assignmentData.dueAt && assignmentData.maxScore > 0 && assignmentData.lectureId > 0;
  const isQuestionsValid = assignmentData.type !== 'mcq' || questions.length > 0;
  const canSubmit = isDetailsValid && isQuestionsValid;

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Create a new assignment or quiz for your students</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {['details', 'questions', 'review'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-medium ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : index < ['details', 'questions', 'review'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="ml-2 font-medium capitalize">{step}</div>
                {index < 2 && (
                  <div className="mx-8 h-1 w-24 bg-muted">
                    <div
                      className={`h-full transition-all ${
                        index < ['details', 'questions', 'review'].indexOf(currentStep) ? 'bg-green-500' : 'bg-muted'
                      }`}
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">Course *</label>
                <select
                  value={selectedCourseId || ''}
                  onChange={(e) => {
                    const courseId = Number(e.target.value);
                    setSelectedCourseId(courseId || null);
                    setAssignmentData({ ...assignmentData, lectureId: 0 });
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a course</option>
                  {courses?.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Lecture *</label>
                <select
                  value={assignmentData.lectureId || ''}
                  onChange={(e) => setAssignmentData({ ...assignmentData, lectureId: Number(e.target.value) })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedCourseId}
                  required
                >
                  <option value="">Select a lecture</option>
                </select>
                {!selectedCourseId && (
                  <p className="mt-1 text-xs text-gray-500">Select a course to see available lectures</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Assignment title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the assignment..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Type *</label>
                <select
                  value={assignmentData.type}
                  onChange={(e) => setAssignmentData({ ...assignmentData, type: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="short">Short Answer</option>
                  <option value="code">Code Assignment</option>
                  <option value="mcq">Multiple Choice Quiz</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Max Score *</label>
                <input
                  type="number"
                  min="1"
                  value={assignmentData.maxScore}
                  onChange={(e) => setAssignmentData({ ...assignmentData, maxScore: Number(e.target.value) })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Due Date *</label>
                <input
                  type="datetime-local"
                  value={assignmentData.dueAt}
                  onChange={(e) => setAssignmentData({ ...assignmentData, dueAt: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Late Window (hours)</label>
                  <input
                    type="number"
                    min="0"
                    value={assignmentData.lateWindowHours}
                    onChange={(e) => setAssignmentData({ ...assignmentData, lateWindowHours: Number(e.target.value) })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0 for no late submissions"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Late Penalty (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentData.latePenaltyPercent}
                    onChange={(e) => setAssignmentData({ ...assignmentData, latePenaltyPercent: Number(e.target.value) })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Percentage to deduct"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'questions' && assignmentData.type === 'mcq' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Quiz Questions</h3>
                <button
                  onClick={addQuestion}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  + Add Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-md bg-muted p-8 text-center">
                  <p className="text-muted-foreground">No questions added yet. Click "Add Question" to create your first question.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="rounded-lg border bg-card p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="font-medium">Question {qIndex + 1}</h4>
                        <button
                          onClick={() => removeQuestion(qIndex)}
                          className="rounded-md border border-input px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mb-4 space-y-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">Question Text</label>
                          <textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                            rows={2}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Enter your question..."
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium">Points</label>
                            <input
                              type="number"
                              min="1"
                              value={question.points}
                              onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium">Answer Options</label>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={question.correctOptionIndex === oIndex}
                                  onChange={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                  className="rounded"
                                />
                                <span className="text-sm font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[oIndex] = e.target.value;
                                    updateQuestion(qIndex, 'options', newOptions);
                                  }}
                                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'questions' && assignmentData.type !== 'mcq' && (
            <div className="rounded-md bg-muted p-8 text-center">
              <p className="text-muted-foreground">
                This assignment type doesn't require questions. Click "Next" to review and create your assignment.
              </p>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Assignment</h3>
              
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h4 className="mb-2 font-medium text-sm">Title</h4>
                  <p>{assignmentData.title}</p>
                </div>

                {assignmentData.description && (
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 font-medium text-sm">Description</h4>
                    <p className="whitespace-pre-wrap">{assignmentData.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 font-medium text-sm">Type</h4>
                    <p className="capitalize">{assignmentData.type}</p>
                  </div>
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 font-medium text-sm">Max Score</h4>
                    <p>{assignmentData.maxScore}</p>
                  </div>
                </div>

                <div className="rounded-md bg-muted p-4">
                  <h4 className="mb-2 font-medium text-sm">Due Date</h4>
                  <p>{new Date(assignmentData.dueAt).toLocaleString()}</p>
                </div>

                {assignmentData.lateWindowHours > 0 && (
                  <div className="rounded-md bg-orange-50 p-4 border border-orange-200">
                    <h4 className="mb-2 font-medium text-sm text-orange-900">Late Submission Policy</h4>
                    <p className="text-sm text-orange-800">
                      Late submissions accepted within {assignmentData.lateWindowHours} hours with {assignmentData.latePenaltyPercent}% penalty
                    </p>
                  </div>
                )}

                {assignmentData.type === 'mcq' && questions.length > 0 && (
                  <div className="rounded-md bg-muted p-4">
                    <h4 className="mb-2 font-medium text-sm">Questions ({questions.length})</h4>
                    <div className="space-y-2">
                      {questions.map((q, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">Q{i + 1}:</span> {q.questionText} ({q.points} pts)
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 'details' || createAssignment.isPending}
              className="rounded-md border border-input bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              Back
            </button>

            {currentStep !== 'review' ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 'details' && !isDetailsValid) ||
                  (currentStep === 'questions' && !isQuestionsValid) ||
                  createAssignment.isPending
                }
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || createAssignment.isPending}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}