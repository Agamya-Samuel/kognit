import type { QuizQuestion } from '@/types/assignments';

interface QuizQuestionItemProps {
  question: QuizQuestion;
  questionNumber: number;
  selectedOption: number | null;
  onOptionSelect: (optionIndex: number) => void;
  disabled?: boolean;
}

export function QuizQuestionItem({
  question,
  questionNumber,
  selectedOption,
  onOptionSelect,
  disabled = false,
}: QuizQuestionItemProps) {
  return (
    <div className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <h4 className="font-semibold text-lg">
          Question {questionNumber}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({question.points} points)
          </span>
        </h4>
      </div>

      <p className="mb-6 text-base">{question.questionText}</p>

      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => !disabled && onOptionSelect(index)}
            disabled={disabled}
            className={`w-full rounded-lg border p-4 text-left transition-all ${
              selectedOption === index
                ? 'border-primary bg-primary/5 text-foreground'
                : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            aria-pressed={selectedOption === index}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}