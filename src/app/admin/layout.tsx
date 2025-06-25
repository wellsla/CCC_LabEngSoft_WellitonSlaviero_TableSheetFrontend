
'use client'; // Must be a client component to use hooks and check localStorage

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, type UserProfile } from '@/services/userProfile'; // Client-side version
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// No longer using 'export const dynamic = 'force-dynamic';' as it's client-side logic now

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null); // null for loading state
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const user = getUserProfile(); // Reads from localStorage
    if (user && user.is_admin) {
      setIsAdmin(true);
      setUserEmail(user.email);
    } else {
      setIsAdmin(false); // User is not admin or not logged in
      setUserEmail(user ? user.email : null);
      router.push('/'); // Redirect to home if not admin
    }
  }, [router]);

  if (isAdmin === null) {
    // Loading state while checking admin status
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // This UI might briefly show before redirect, or if redirect fails.
    // The primary protection is the router.push('/') in useEffect.
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

  // console.log(
  //   `[AdminLayout] Access Granted for admin user: ${userEmail}`
  // );
  return <div className="w-full">{children}</div>;
}
