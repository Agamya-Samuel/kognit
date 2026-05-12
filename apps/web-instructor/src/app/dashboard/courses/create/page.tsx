'use client';

import { useState } from 'react';
import { Card, CardContent } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseDetailsStep } from '@/components/course-creation/CourseDetailsStep';
import { SectionsStep } from '@/components/course-creation/SectionsStep';
import { LecturesStep } from '@/components/course-creation/LecturesStep';
import { PricingStep } from '@/components/course-creation/PricingStep';
import { ReviewStep } from '@/components/course-creation/ReviewStep';

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
    // TODO: Submit course to API
    console.log('Submitting course:', courseData);
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Course</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Follow these steps to create a new course.
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
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
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        index === currentStepIndex
                          ? 'text-gray-900 dark:text-white'
                          : index < currentStepIndex
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>{renderStep()}</Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStepIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        {currentStepIndex === steps.length - 1 ? (
          <Button onClick={handleSubmit} className="gap-2">
            Create Course
          </Button>
        ) : (
          <Button onClick={handleNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
