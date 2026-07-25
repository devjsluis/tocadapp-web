export function GigSkeleton() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-32 bg-zinc-800 rounded-md" />
        <div className="h-4 w-16 bg-zinc-800 rounded-full" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
        <div className="h-3 w-1/2 bg-zinc-800 rounded" />
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between">
        <div className="space-y-1">
          <div className="h-2 w-10 bg-zinc-800 rounded" />
          <div className="h-5 w-20 bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
