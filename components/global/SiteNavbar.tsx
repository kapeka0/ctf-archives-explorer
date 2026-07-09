"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { LogOut, User } from "lucide-react";
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
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";

function UserMenu() {
  const t = useTranslations("Nav");
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-8" size="icon" variant="outline">
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur-md">
      <MaxWidthWrapper className="flex h-14 items-center justify-between">
        <Link className="transition-opacity hover:opacity-70" href="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <LangToggle />
          <div className="mx-1 h-5 w-px bg-border" />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button className="h-8 px-3 text-xs" size="sm">
                {t("signIn")}
              </Button>
            </Link>
          </Unauthenticated>
          <Authenticated>
            <UserMenu />
          </Authenticated>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}

export default SiteNavbar;
