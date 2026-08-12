import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-2xl px-6 py-10">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-9 w-56 rounded-md" />
        </CardContent>
      </Card>
    </main>
  );
}
