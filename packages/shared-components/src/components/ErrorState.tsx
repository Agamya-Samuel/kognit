import { cn } from "../lib/utils"
import { AlertTriangle } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(
      "flex min-h-[400px] flex-col items-center justify-center rounded-lg border bg-destructive/10 p-12 text-center",
      className
    )}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-destructive">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      )}
    </div>
  )
}