'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { CheckCircle2, ChevronLeft, ChevronRight, BookOpen, Users, TrendingUp } from 'lucide-react';
import { StatCard, StatsRow } from '@/components/StatsRow';
import { CourseDetailsStep } from '@/components/course-creation/CourseDetailsStep';
import { SectionsStep } from '@/components/course-creation/SectionsStep';
import { LecturesStep } from '@/components/course-creation/LecturesStep';
import { PricingStep } from '@/components/course-creation/PricingStep';
import { ReviewStep } from '@/components/course-creation/ReviewStep';
import { useCreateCourse } from '@/hooks/useCourses';

type Step = 'details' | 'sections' | 'lectures' | 'pricing' | 'review';

const steps = [
  { id: 'details' as Step, label: 'Course Details', description: 'Basic information' },
  { id: 'sections' as Step, label: 'Sections', description: 'Organize content' },
  { id: 'lectures' as Step, label: 'Lectures', description: 'Add lessons' },
  { id: 'pricing' as Step, label: 'Pricing', description: 'Set price' },
  { id: 'review' as Step, label: 'Review', description: 'Preview & publish' },
];

export default function CreateCoursePage() {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    domain: '',
    thumbnailUrl: '',
    sections: [],
    lectures: [],
    pricingType: 'free' as 'free' | 'paid',
    priceInr: 0,
    isPublished: false,
  });

  const createCourseMutation = useCreateCourse();
  const { mutate: createCourse, isPending: isCreating } = createCourseMutation;

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSubmit = () => {
    if (!courseData.title || !courseData.domain) {
      console.error('Please fill in all required fields');
      return;
    }

    const createData = {
      title: courseData.title,
      description: courseData.description,
      domain: courseData.domain,
      pricingType: courseData.pricingType,
      priceInr: courseData.priceInr,
    };

    createCourse(createData, {
      onSuccess: (data) => {
        console.log('Course created successfully');
        window.location.href = `/dashboard/courses/${data.id}`;
      },
      onError: (error) => {
        console.error('Failed to create course:', error);
      },
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'details':
        return <CourseDetailsStep data={courseData} onChange={setCourseData} />;
      case 'sections':
        return <SectionsStep data={courseData} onChange={setCourseData} />;
      case 'lectures':
        return <LecturesStep data={courseData} onChange={setCourseData} />;
      case 'pricing':
        return <PricingStep data={courseData} onChange={setCourseData} />;
      case 'review':
        return <ReviewStep data={courseData} onChange={setCourseData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Course</h1>
          <p className="mt-2 text-muted-foreground">
            Follow these steps to create a new course.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Course Creation Steps</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
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
                    <div
                      className={`text-sm font-medium ${
                        index === currentStepIndex
                          ? 'text-foreground'
                          : index < currentStepIndex
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      index < currentStepIndex ? 'bg-emerald-600' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {currentStepIndex === steps.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Course
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
