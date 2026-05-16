interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
      {icon && <div className="mb-4 text-6xl">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-6 text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}