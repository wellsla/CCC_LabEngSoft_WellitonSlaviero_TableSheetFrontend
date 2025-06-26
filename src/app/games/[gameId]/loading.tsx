
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <Skeleton className="mb-6 h-9 w-40" />

      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="relative mx-auto mb-6 aspect-video w-full max-h-[300px] rounded-lg sm:w-2/3 lg:w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
          </div>

          <Skeleton className="my-6 h-px w-full" />

          <div className="space-y-4">
            <Skeleton className="h-6 w-72" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
