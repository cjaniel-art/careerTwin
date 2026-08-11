import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />

      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="mt-2 h-3.5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
