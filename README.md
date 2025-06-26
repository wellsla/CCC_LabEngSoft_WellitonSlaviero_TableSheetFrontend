# TableSheet - Frontend para Gerenciamento de Fichas de RPG

Este é um projeto [Next.js](https://nextjs.org) inicializado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), desenvolvido para gerenciar fichas de personagens de RPG de mesa.

## Sobre o Projeto

TableSheet é uma aplicação web moderna para criação, gerenciamento e compartilhamento de fichas de personagens de RPG. A aplicação permite aos usuários:

- Criar e gerenciar personagens de RPG
- Acessar regras e livros de regras
- Participar de jogos
- Gerenciar perfis de usuário
- Gerar PDFs de fichas de personagens
- Administrar conteúdo (para administradores)

## Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 18
- **Estilização**: TailwindCSS
- **Backend/Database**: Firebase
- **Autenticação**: Firebase Auth
- **Gerenciamento de Estado**: React Query
- **Formulários**: React Hook Form, Zod
- **Componentes UI**: Radix UI
- **Geração de PDF**: jsPDF, React PDF
- **Gráficos**: Recharts

## Começando

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env.local`
   - Preencha as variáveis necessárias com suas credenciais do Firebase

### Executando o Servidor de Desenvolvimento

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Estrutura do Projeto

```
src/
├── app/                  # Rotas e páginas da aplicação
│   ├── about/            # Página sobre a aplicação
│   ├── admin/            # Painel de administração
│   ├── auth/             # Autenticação
│   ├── characters/       # Gerenciamento de personagens
│   ├── games/            # Gerenciamento de jogos
│   ├── profile/          # Perfil do usuário
│   └── rulebooks/        # Livros de regras
├── components/           # Componentes reutilizáveis
├── contexts/             # Contextos React
├── hooks/                # Hooks personalizados
├── lib/                  # Utilitários e configurações
└── services/             # Serviços para comunicação com APIs
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com Turbopack
- `npm run build` - Constrói a aplicação para produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npm run lint:fix` - Corrige problemas de linting
- `npm run format` - Formata o código com Prettier
- `npm run typecheck` - Verifica tipos TypeScript

## Saiba Mais

Para aprender mais sobre Next.js, consulte os seguintes recursos:

- [Documentação do Next.js](https://nextjs.org/docs) - aprenda sobre os recursos e API do Next.js.
- [Aprenda Next.js](https://nextjs.org/learn) - um tutorial interativo de Next.js.

## Implantação

A maneira mais fácil de implantar seu aplicativo Next.js é usar a [Plataforma Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) dos criadores do Next.js.

Consulte a [documentação de implantação do Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para mais detalhes.
