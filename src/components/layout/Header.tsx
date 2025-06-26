
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Gamepad2,
  Users,
  LogOut,
  UserCircle,
  Settings,
  Library,
  UserCog,
  Info,
  Loader2,
  BookCopy, // For Classes
  Palette, // For Races (example, can be changed)
  FileText, // For Books/PDFs
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getUserProfile,
  type UserProfile,
  verifyAndFetchUserProfile,
} from '@/services/userProfile';
import { logoutAction } from '@/app/auth/actions';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      // This now uses the mock-aware getUserProfile
      const user = await verifyAndFetchUserProfile();
      setCurrentUser(user);
      setIsLoadingUser(false);
    };
    fetchUser();
  }, []);

  const isLoggedIn = !!currentUser;
  const isAdmin = currentUser?.is_admin === true;

  const handleLogout = async () => {
    // MOCK AUTH: Clear mock session from localStorage
    localStorage.removeItem('mockUserType');
    localStorage.removeItem('sessionUserData');
    setCurrentUser(null);
    await logoutAction(); // Redirects
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const baseNavItems = [
    {
      href: '/games',
      label: 'Jogos',
      icon: <Gamepad2 className="mr-2 h-4 w-4" />,
      loggedInOnly: false,
      alwaysShow: true,
    },
    {
      href: '/characters',
      label: 'Meus Personagens',
      icon: <Users className="mr-2 h-4 w-4" />,
      loggedInOnly: true,
      alwaysShow: false,
    },
    {
      href: '/about',
      label: 'Sobre',
      icon: <Info className="mr-2 h-4 w-4" />,
      loggedInOnly: false,
      alwaysShow: true,
    },
  ];

  const navItems = baseNavItems.filter(
    (item) => item.alwaysShow || (item.loggedInOnly && isLoggedIn)
  );

  const adminNavItems = [
    {
      href: '/admin/games',
      label: 'Gerenciar Jogos',
      icon: <Library className="mr-2 h-4 w-4" />,
    },
    {
      href: '/admin/classes',
      label: 'Gerenciar Classes',
      icon: <BookCopy className="mr-2 h-4 w-4" />,
    },
    {
      href: '/admin/races',
      label: 'Gerenciar Raças',
      icon: <Palette className="mr-2 h-4 w-4" />,
    },
    {
      href: '/admin/books',
      label: 'Gerenciar Livros',
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      href: '/admin/users',
      label: 'Gerenciar Usuários',
      icon: <UserCog className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="mr-6 flex items-center gap-2"
          onClick={handleLinkClick}
        >
          <Image
            src="https://placehold.co/64x64.png"
            width={28}
            height={28}
            alt="TableSheet Logo"
            className="h-7 w-7 object-contain"
            data-ai-hint="logo placeholder"
          />
          <span className="text-xl font-semibold tracking-tight text-primary">
            TableSheet
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className="px-3 py-2 text-foreground/80 hover:bg-accent/10 hover:text-primary"
            >
              <Link href={item.href} className="flex items-center">
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            <ThemeToggleButton />
            {isLoadingUser ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isLoggedIn && currentUser ? (
              <>
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-foreground/80 hover:bg-accent/10 hover:text-primary"
                        aria-label="Painel Admin"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Painel Admin</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ferramentas Admin</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {adminNavItems.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link
                            href={item.href}
                            className="flex w-full items-center"
                          >
                            {item.icon}
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <Link href="/profile" aria-label="Ver Perfil">
                  <Avatar className="h-9 w-9 cursor-pointer rounded-full ring-1 ring-primary/30 ring-offset-2 ring-offset-background transition-all duration-300 hover:ring-primary/70">
                    <AvatarImage
                      src={currentUser.avatar_url ?? undefined}
                      alt={currentUser.name ?? 'Avatar do Usuário'}
                      data-ai-hint={currentUser.dataAiHint || 'user avatar'}
                    />
                    <AvatarFallback>
                      {currentUser.name ? (
                        currentUser.name.substring(0, 2).toUpperCase()
                      ) : (
                        <UserCircle className="h-5 w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center text-foreground/80 hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">Cadastrar</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[300px] flex-col p-0 sm:w-[360px]"
            >
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={handleLinkClick}
                >
                  <Image
                    src="https://placehold.co/64x64.png"
                    width={24}
                    height={24}
                    alt="TableSheet Logo"
                    className="h-6 w-6 object-contain"
                    data-ai-hint="logo placeholder"
                  />
                  <span className="text-lg font-semibold text-primary">
                    TableSheet
                  </span>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggleButton />
                </div>
              </div>

              <nav className="flex-grow space-y-1 p-4 text-base font-medium">
                {isLoadingUser ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : isLoggedIn && currentUser ? (
                  <Link
                    href="/profile"
                    className="mb-3 flex items-center gap-3 rounded-lg border-b p-3 text-muted-foreground transition-all hover:bg-accent/10 hover:text-primary"
                    onClick={handleLinkClick}
                  >
                    <Avatar className="h-11 w-11">
                      <AvatarImage
                        src={currentUser.avatar_url ?? undefined}
                        alt={currentUser.name ?? 'Avatar do Usuário'}
                        data-ai-hint={
                          currentUser.dataAiHint || 'user avatar mobile'
                        }
                      />
                      <AvatarFallback>
                        {currentUser.name ? (
                          currentUser.name.substring(0, 2).toUpperCase()
                        ) : (
                          <UserCircle className="h-7 w-7" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {currentUser.name}
                      </span>
                      <span className="text-sm">Perfil</span>
                    </div>
                  </Link>
                ) : null}

                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-accent/10 hover:text-primary"
                    onClick={handleLinkClick}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}

                {isLoggedIn && isAdmin && (
                  <>
                    <DropdownMenuSeparator className="my-2 bg-border" />
                    <span className="block px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Ferramentas Admin
                    </span>
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:bg-accent/10 hover:text-primary"
                        onClick={handleLinkClick}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                  </>
                )}
              </nav>

              <div className="mt-auto space-y-3 border-t p-4">
                {isLoadingUser ? null : isLoggedIn ? (
                  <Button
                    variant="outline"
                    className="flex w-full items-center justify-center py-3 text-base hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Sair
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full py-3 text-base"
                      asChild
                      onClick={handleLinkClick}
                    >
                      <Link href="/auth/login">Entrar</Link>
                    </Button>
                    <Button
                      className="w-full py-3 text-base"
                      asChild
                      onClick={handleLinkClick}
                    >
                      <Link href="/auth/register">Cadastrar</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;

    