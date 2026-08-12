import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col gap-[21px] px-8 py-6">
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-8 w-32 rounded-[10px]" />
      </div>

      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vaga</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-center">Lacunas</TableHead>
              <TableHead className="text-center">Riscos</TableHead>
              <TableHead>Score de aderência</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-1.5 h-3 w-28" />
                </TableCell>
                <TableCell className="py-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1.5 h-3 w-20" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-6 rounded" />
                    <Skeleton className="size-6 rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Skeleton className="min-h-24 w-full flex-1 rounded-2xl" />
    </main>
  );
}
