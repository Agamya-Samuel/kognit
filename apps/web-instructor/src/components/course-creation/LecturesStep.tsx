import { CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Input } from '@edutech/ui';

interface LecturesStepProps {
  data: any;
  onChange: (data: any) => void;
}

export function LecturesStep({ data }: LecturesStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Course Lectures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add lectures to your course sections. Lectures can be videos, documents, or text
          content.
        </p>

        {data.sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No sections to add lectures to</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Go back and add sections first
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.sections.map((section: any, sectionIndex: number) => (
              <div key={section.id} className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {section.title || `Section ${sectionIndex + 1}`}
                </h4>
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-800 space-y-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No lectures added yet
                  </p>
                  <Input placeholder="Lecture title..." className="max-w-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </>
  );
}
