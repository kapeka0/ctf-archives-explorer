"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Flag, LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";

import LangToggle from "@/components/global/LangToggle";
import { ThemeToggle } from "@/components/global/ThemeToggle";
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
        <Button size="icon" variant="outline">
          <User className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-52 truncate font-normal text-muted-foreground">
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
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <MaxWidthWrapper className="flex h-14 items-center justify-between">
        <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
          <Flag className="size-4 text-primary" />
          {t("brand")}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LangToggle />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button size="sm">{t("signIn")}</Button>
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
