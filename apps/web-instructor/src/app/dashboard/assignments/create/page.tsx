'use client';

import { useState } from 'react';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useMyCourses } from '@/hooks/useCourses';
import { Button } from '@edutech/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Textarea } from '@edutech/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@edutech/ui';
import { CheckCircle2, Circle } from 'lucide-react';

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
      console.log('Assignment created successfully');
      window.location.href = '/dashboard/assignments';
    } catch (error) {
      console.error('Failed to create assignment');
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

  const steps = [
    { id: 'details' as Step, label: 'Details', description: 'Basic information' },
    { id: 'questions' as Step, label: 'Questions', description: assignmentData.type === 'mcq' ? 'Add quiz questions' : 'Review requirements' },
    { id: 'review' as Step, label: 'Review', description: 'Preview & publish' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Assignment</h1>
        <p className="mt-2 text-muted-foreground">Create a new assignment or quiz for your students</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                      index === currentStepIndex
                        ? 'bg-primary text-primary-foreground'
                        : index < currentStepIndex
                          ? 'bg-emerald-600 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${
                      index === currentStepIndex ? 'text-foreground' : index < currentStepIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${index < currentStepIndex ? 'bg-emerald-600' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {currentStep === 'details' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select value={selectedCourseId?.toString()} onValueChange={(val) => {
                  const courseId = Number(val);
                  setSelectedCourseId(courseId || null);
                  setAssignmentData({ ...assignmentData, lectureId: 0 });
                }}>
                  <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lecture">Lecture *</Label>
                <Select disabled={!selectedCourseId} value={assignmentData.lectureId.toString()} onValueChange={(val) => setAssignmentData({ ...assignmentData, lectureId: Number(val) })}>
                  <SelectTrigger id="lecture">
                    <SelectValue placeholder="Select a lecture" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select a lecture</SelectItem>
                  </SelectContent>
                </Select>
                {!selectedCourseId && (
                  <p className="text-xs text-muted-foreground">Select a course to see available lectures</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={assignmentData.title}
                  onChange={(e) => setAssignmentData({ ...assignmentData, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assignmentData.description}
                  onChange={(e) => setAssignmentData({ ...assignmentData, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the assignment..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={assignmentData.type} onValueChange={(val) => setAssignmentData({ ...assignmentData, type: val as any })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short Answer</SelectItem>
                    <SelectItem value="code">Code Assignment</SelectItem>
                    <SelectItem value="mcq">Multiple Choice Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxScore">Max Score *</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="1"
                  value={assignmentData.maxScore}
                  onChange={(e) => setAssignmentData({ ...assignmentData, maxScore: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueAt">Due Date *</Label>
                <Input
                  id="dueAt"
                  type="datetime-local"
                  value={assignmentData.dueAt}
                  onChange={(e) => setAssignmentData({ ...assignmentData, dueAt: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lateWindowHours">Late Window (hours)</Label>
                  <Input
                    id="lateWindowHours"
                    type="number"
                    min="0"
                    value={assignmentData.lateWindowHours}
                    onChange={(e) => setAssignmentData({ ...assignmentData, lateWindowHours: Number(e.target.value) })}
                    placeholder="0 for no late submissions"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latePenaltyPercent">Late Penalty (%)</Label>
                  <Input
                    id="latePenaltyPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={assignmentData.latePenaltyPercent}
                    onChange={(e) => setAssignmentData({ ...assignmentData, latePenaltyPercent: Number(e.target.value) })}
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
                <Button onClick={addQuestion}>
                  Add Question
                </Button>
              </div>

              {questions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <p className="text-muted-foreground">No questions added yet. Click "Add Question" to create your first question.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <Card key={qIndex}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Question {qIndex + 1}</CardTitle>
                          <Button variant="outline" size="sm" onClick={() => removeQuestion(qIndex)}>
                            Remove
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Question Text</Label>
                          <Textarea
                            value={question.questionText}
                            onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                            rows={2}
                            placeholder="Enter your question..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Points</Label>
                          <Input
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Answer Options</Label>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                                  className="flex-shrink-0"
                                >
                                  {question.correctOptionIndex === oIndex ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </button>
                                <span className="text-sm font-medium">{String.fromCharCode(65 + oIndex)}.</span>
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[oIndex] = e.target.value;
                                    updateQuestion(qIndex, 'options', newOptions);
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStep === 'questions' && assignmentData.type !== 'mcq' && (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <p className="text-muted-foreground">
                This assignment type doesn't require questions. Click "Next" to review and create your assignment.
              </p>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Assignment</h3>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 text-sm font-medium">Title</h4>
                  <p>{assignmentData.title}</p>
                </div>

                {assignmentData.description && (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Description</h4>
                    <p className="whitespace-pre-wrap">{assignmentData.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Type</h4>
                    <p className="capitalize">{assignmentData.type}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Max Score</h4>
                    <p>{assignmentData.maxScore}</p>
                  </div>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 text-sm font-medium">Due Date</h4>
                  <p>{new Date(assignmentData.dueAt).toLocaleString()}</p>
                </div>

                {assignmentData.lateWindowHours > 0 && (
                  <div className="rounded-lg border bg-orange-50 dark:bg-orange-950 p-4">
                    <h4 className="mb-2 text-sm font-medium text-orange-900 dark:text-orange-100">Late Submission Policy</h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Late submissions accepted within {assignmentData.lateWindowHours} hours with {assignmentData.latePenaltyPercent}% penalty
                    </p>
                  </div>
                )}

                {assignmentData.type === 'mcq' && questions.length > 0 && (
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="mb-2 text-sm font-medium">Questions ({questions.length})</h4>
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

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 'details' || createAssignment.isPending}
            >
              Back
            </Button>

            {currentStep !== 'review' ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 'details' && !isDetailsValid) ||
                  (currentStep === 'questions' && !isQuestionsValid) ||
                  createAssignment.isPending
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || createAssignment.isPending}
              >
                {createAssignment.isPending ? 'Creating...' : 'Create Assignment'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}