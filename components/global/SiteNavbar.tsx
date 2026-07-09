"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { LogOut, Plus, User } from "lucide-react";
import { useTranslations } from "next-intl";

import LangToggle from "@/components/global/LangToggle";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import Wordmark from "@/components/global/Wordmark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";

function UserMenu() {
  const t = useTranslations("Nav");
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-8 rounded-full" size="icon" variant="ghost">
          <User className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-52 truncate font-mono text-xs font-normal text-muted-foreground">
          {viewer?.email ?? t("account")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => void signOut()}>
          <LogOut className="mr-2 size-4" />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SiteNavbar() {
  const t = useTranslations("Nav");

  return (
    <header className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border bg-background/70 py-1.5 pl-4 pr-1.5 shadow-sm backdrop-blur-md">
        <Link className="transition-opacity hover:opacity-70" href="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-0.5">
          <Link href="/submit">
            <Button className="h-8 gap-1.5 rounded-full px-3 text-xs" size="sm" variant="ghost">
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">{t("submit")}</span>
            </Button>
          </Link>
          <ThemeToggle />
          <LangToggle />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button className="ml-1 h-8 rounded-full px-3.5 text-xs" size="sm">
                {t("signIn")}
              </Button>
            </Link>
          </Unauthenticated>
          <Authenticated>
            <UserMenu />
          </Authenticated>
        </div>
      </nav>
    </header>
  );
}

export default SiteNavbar;
