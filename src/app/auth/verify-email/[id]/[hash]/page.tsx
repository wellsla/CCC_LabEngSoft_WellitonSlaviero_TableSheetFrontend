
'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/clientApi';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const params = useParams();
  const [status, setStatus] = React.useState<VerificationStatus>('loading');
  const [message, setMessage] = React.useState('Verificando seu e-mail...');
  const id = params.id as string;
  const hash = params.hash as string;

  React.useEffect(() => {
    document.title = 'Verificação de E-mail - TableSheet';
  }, []);

  React.useEffect(() => {
    if (!id || !hash) {
      setMessage('Link de verificação inválido ou incompleto.');
      setStatus('error');
      return;
    }

    async function verify() {
      try {
        const response = await apiClient.verifyEmail(id, hash);
        setMessage(response.message || 'E-mail verificado com sucesso! Você já pode fazer login.');
        setStatus('success');
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro ao verificar seu e-mail.';
        setMessage(errorMessage);
        setStatus('error');
      }
    }

    verify();
  }, [id, hash]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === 'loading' && <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />}
          {status === 'success' && <CheckCircle className="mx-auto h-12 w-12 text-green-500" />}
          {status === 'error' && <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />}
          <CardTitle className="mt-4 text-2xl">
            {status === 'loading' && 'Verificando...'}
            {status === 'success' && 'E-mail Verificado!'}
            {status === 'error' && 'Falha na Verificação'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{message}</CardDescription>
        </CardContent>
        {status !== 'loading' && (
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/auth/login">Ir para o Login</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
