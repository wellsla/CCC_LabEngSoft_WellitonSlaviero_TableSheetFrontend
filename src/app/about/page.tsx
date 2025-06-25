
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Users, ShieldHalf, Gamepad2 } from 'lucide-react';
import { getUserProfile } from '@/services/userProfile'; // Used for conditional link

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const user = getUserProfile();
    setIsLoggedIn(!!user);
  }, []);

  React.useEffect(() => {
    document.title = 'Sobre o TableSheet - Seu Companheiro de RPG';
  }, []);

  if (isLoggedIn === null) {
    return <div className="container mx-auto space-y-12 px-4 py-12">Carregando...</div>;
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-12">
      <section className="text-center">
        <ShieldHalf className="mx-auto mb-4 h-16 w-16 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
          Sobre o TableSheet
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          O TableSheet foi projetado para ser seu companheiro digital definitivo para jogos de RPG de mesa. Otimize o gerenciamento de personagens, mantenha as regras ao seu alcance e organize suas campanhas como nunca antes.
        </p>
      </section>

      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-3xl font-semibold text-primary">
            O que é o TableSheet?
          </h2>
          <p className="mb-4 text-muted-foreground">
            Imagine um mundo onde suas fichas de personagem estão sempre atualizadas, as regras do jogo são acessíveis instantaneamente e suas anotações de campanha estão organizadas de forma impecável. Essa é a visão por trás do TableSheet. Nosso objetivo é reduzir a desordem e a sobrecarga administrativa dos TTRPGs, permitindo que você se concentre na história e na diversão.
          </p>
          <p className="text-muted-foreground">
            Seja você um Mestre de Jogo experiente ou um jogador iniciante, o TableSheet fornece ferramentas intuitivas para aprimorar suas sessões de jogo.
          </p>
        </div>
        <div className="overflow-hidden rounded-lg shadow-xl">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Cena de aventura de fantasia com personagens diversos"
            width={600}
            height={400}
            className="h-auto w-full object-cover"
            data-ai-hint="fantasy adventure"
          />
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="mb-8 text-center text-3xl font-semibold text-primary">
          Recursos Principais
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <FeatureHighlight
            icon={<Users className="h-10 w-10 text-accent" />}
            title="Gerenciamento de Personagens"
            description="Crie, customize e acompanhe seus personagens de RPG com fichas de personagem digitais. Chega de papéis perdidos ou estatísticas apagadas!"
          />
          <FeatureHighlight
            icon={<BookOpen className="h-10 w-10 text-accent" />}
            title="Acesso a Livros de Regras"
            description="Anexe livros de regras em PDF aos seus jogos e acesse-os diretamente no aplicativo. Consulte regras rapidamente sem quebrar a imersão."
          />
          <FeatureHighlight
            icon={<Gamepad2 className="h-10 w-10 text-accent" />}
            title="Organização de Jogos"
            description="Gerencie sua coleção de jogos, visualize seus detalhes e mantenha tudo organizado em um hub central."
          />
        </div>
      </section>

      <section className="grid items-center gap-8 md:grid-cols-2">
        <div className="order-first overflow-hidden rounded-lg shadow-xl md:order-last">
          <Image
            src="https://placehold.co/600x400.png"
            alt="Exemplo de interface de ficha de personagem digital"
            width={600}
            height={400}
            className="h-auto w-full object-cover"
            data-ai-hint="character sheet"
          />
        </div>
        <div>
          <h2 className="mb-4 text-3xl font-semibold text-primary">
            Nossa Missão
          </h2>
          <p className="mb-4 text-muted-foreground">
            Nossa missão é aproveitar a tecnologia para tornar os jogos de mesa mais acessíveis, organizados e agradáveis para todos. Acreditamos no poder da narrativa e do jogo colaborativo, e o TableSheet é nossa contribuição para este hobby incrível.
          </p>
          <p className="text-muted-foreground">
            Estamos constantemente trabalhando em novos recursos e melhorias com base no feedback da comunidade.
          </p>
        </div>
      </section>

      <section className="mt-12 border-t py-12 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-primary">
          Pronto para Aprimorar Seu Jogo?
        </h2>
        <p className="mx-auto mb-6 max-w-xl text-lg text-muted-foreground">
          Junte-se à comunidade TableSheet hoje e leve suas sessões de RPG de mesa para o próximo nível.
        </p>
        <Button asChild size="lg">
          <Link href={isLoggedIn ? "/characters" : "/auth/register"}>
            {isLoggedIn ? 'Gerenciar Personagens' : 'Comece Gratuitamente'}
          </Link>
        </Button>
      </section>
    </div>
  );
}

interface FeatureHighlightProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureHighlight({
  icon,
  title,
  description,
}: FeatureHighlightProps) {
  return (
    <Card className="flex h-full flex-col text-center">
      <CardHeader className="flex-shrink-0">
        <div className="mx-auto mb-4 w-fit rounded-full bg-accent/10 p-3">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
