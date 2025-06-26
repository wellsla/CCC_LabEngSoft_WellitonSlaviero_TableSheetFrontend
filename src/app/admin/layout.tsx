
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;

    if (!user || !user.is_admin) {
      router.replace('/');
    }
  }, [user, isLoading, router]);


  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!user?.is_admin) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-fit rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              You do not have permission to view this page. Redirecting...
            </p>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <div className="w-full">{children}</div>;
}
