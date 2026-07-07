export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
        <p className="text-body-small-s text-zinc-500">{text}</p>
      </div>
    </main>
  );
}
