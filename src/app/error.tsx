
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
                                error,
                                reset,
                              }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-fit rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle>Algo deu errado!</CardTitle>
          <CardDescription>
            {error.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Você pode tentar recarregar a página para resolver o problema.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => reset()}>Tentar Novamente</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
