
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Gamepad2, Users, UserCircle2, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isLoading } = useAuth();
  const isLoggedIn = !!user;

  const featureCards = [
    {
      icon: <Users className="h-10 w-10 text-accent" />,
      title: 'Gerenciamento de Personagens',
      description: 'Crie, atualize e acompanhe seus personagens com facilidade. Acesse suas fichas digitais em qualquer lugar.',
      link: isLoggedIn ? '/characters' : '/auth/register',
      learnMoreText: isLoggedIn
        ? 'Meus Personagens'
        : 'Cadastre-se para Criar Personagens',
    },
    {
      icon: <Gamepad2 className="h-10 w-10 text-accent" />,
      title: 'Biblioteca de Jogos e Livros de Regras',
      description: 'Explore jogos suportados, veja detalhes e acesse os livros de regras em PDF associados diretamente.',
      link: '/games',
      learnMoreText: 'Explorar Jogos',
    },
    {
      icon: <UserCircle2 className="h-10 w-10 text-accent" />,
      title: 'Perfil e Configurações',
      description: 'Gerencie sua conta, personalize seu avatar e atualize suas credenciais.',
      link: isLoggedIn ? '/profile' : '/auth/register',
      learnMoreText: isLoggedIn
        ? 'Meu Perfil'
        : 'Cadastre-se para Gerenciar o Perfil',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="rounded-lg bg-secondary py-16 text-center shadow-md">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Bem-vindo ao TableSheet
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
          Seu companheiro digital definitivo para gerenciar personagens, regras, e jogos para suas aventuras de RPG de mesa.
        </p>
        <div className="space-x-2 sm:space-x-4">
          <Button asChild size="lg">
            <Link href={isLoggedIn ? '/characters' : '/auth/register'}>
              {isLoggedIn ? 'Gerenciar Personagens' : 'Comece Agora'}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/games">Explorar Jogos</Link>
          </Button>
          <Button
            asChild
            variant="link"
            size="lg"
            className="mt-2 text-primary hover:text-accent sm:mt-0"
          >
            <Link href="/about">
              Saiba Mais Sobre o TableSheet <Info className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">
          Recursos Principais
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featureCards.map((card) => (
            <FeatureCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              link={card.link}
              learnMoreText={card.learnMoreText}
            />
          ))}
        </div>
      </section>

      {!isLoggedIn && (
        <section className="border-t py-12 text-center">
          <h2 className="mb-4 text-2xl font-semibold text-primary">
            Pronto para Melhorar Seu Jogo?
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-lg text-muted-foreground">
            Cadastre-se hoje e leve suas sessões de RPG de mesa para o próximo nível.
          </p>
          <Button asChild size="lg">
            <Link href="/auth/register">Cadastre-se Agora</Link>
          </Button>
        </section>
      )}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  learnMoreText: string;
}

function FeatureCard({
                       icon,
                       title,
                       description,
                       link,
                       learnMoreText,
                     }: FeatureCardProps) {
  return (
    <Card className="flex flex-col text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
      <CardHeader className="flex-shrink-0">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 p-3">
          {icon}
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col justify-between">
        <CardDescription className="mb-4 text-base">
          {description}
        </CardDescription>
        <Button variant="link" className="mt-auto text-base" asChild>
          <Link href={link}>{learnMoreText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
