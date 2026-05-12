import { useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Button } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface Section {
  id: number;
  title: string;
  order: number;
}

interface SectionsStepProps {
  data: {
    sections: Section[];
  };
  onChange: (data: any) => void;
}

export function SectionsStep({ data, onChange }: SectionsStepProps) {
  const sectionsList = data.sections || [];
  const [sections, setSections] = useState<Section[]>(sectionsList);

  const addSection = () => {
    const newSection: Section = {
      id: Date.now(),
      title: '',
      order: sections.length,
    };
    const updatedSections = [...sections, newSection];
    setSections(updatedSections);
    onChange({ ...data, sections: updatedSections });
  };

  const removeSection = (id: number) => {
    const updatedSections = sections.filter((s) => s.id !== id);
    setSections(updatedSections);
    onChange({ ...data, sections: updatedSections });
  };

  const updateSection = (id: number, title: string) => {
    const updatedSections = sections.map((s) => (s.id === id ? { ...s, title } : s));
    setSections(updatedSections);
    onChange({ ...data, sections: updatedSections });
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Course Sections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add sections to organize your course content. You can reorder them by dragging.
        </p>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No sections added yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Add your first section to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-950"
              >
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`section-${section.id}`} className="text-sm">
                    Section {index + 1}
                  </Label>
                  <Input
                    id={`section-${section.id}`}
                    value={section.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateSection(section.id, e.target.value)
                    }
                    placeholder="e.g., Introduction, Getting Started"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={addSection} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </CardContent>
    </>
  );
}
