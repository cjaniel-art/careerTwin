import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-6 px-8 py-6">
      <Skeleton className="h-8 w-36" />

      <div className="flex flex-col gap-6 md:flex-row">
        <Card className="md:flex-1">
          <CardHeader>
            <Skeleton className="h-4 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-14" />
            <Skeleton className="mt-2 h-3.5 w-24" />
          </CardContent>
        </Card>

        <Card className="md:flex-1">
          <CardHeader>
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <Skeleton className="h-9 w-10" />
              <Skeleton className="mt-2 h-3.5 w-28" />
            </div>
            <Skeleton className="h-9 w-32 rounded-md" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row">
        <Skeleton className="h-[488px] w-full shrink-0 rounded-2xl lg:h-auto lg:w-[299px]" />
        <Skeleton className="h-[488px] min-w-0 flex-1 rounded-2xl lg:h-auto" />
        <Skeleton className="h-[488px] min-w-0 flex-1 rounded-2xl lg:h-auto" />
      </div>
    </main>
  );
}
