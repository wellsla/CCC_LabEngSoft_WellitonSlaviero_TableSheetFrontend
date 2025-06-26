
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function GameCardSkeleton() {
  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <Skeleton className="aspect-[16/9] w-full" />
      <CardHeader className="pb-2">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3">
        <Skeleton className="h-5 w-24" />
      </CardFooter>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <GameCardSkeleton />
        <GameCardSkeleton />
        <GameCardSkeleton />
        <GameCardSkeleton />
        <GameCardSkeleton />
        <GameCardSkeleton />
      </div>
    </div>
  );
}
