
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-80" />
        <Button disabled>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Classe
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-5 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-48" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="ml-auto h-5 w-16" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full max-w-xs" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
