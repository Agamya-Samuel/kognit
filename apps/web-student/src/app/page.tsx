export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to EduTech</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Discover amazing courses and start learning today
        </p>
        <a
          href="/courses"
          className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Browse Courses
        </a>
      </div>
    </div>
  );
}
