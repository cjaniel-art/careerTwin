import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />

      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-8 w-24 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
