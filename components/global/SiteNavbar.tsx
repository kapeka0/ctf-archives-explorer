"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import CatAvatar from "@/components/global/CatAvatar";
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
import ExternalLink from "@/components/ui/external-link";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function UserMenu() {
  const t = useTranslations("Nav");
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);
  const username = viewer?.username ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 flex items-center justify-center rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          type="button"
        >
          <CatAvatar size={28} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <CatAvatar size={22} />
          <span className="max-w-40 truncate font-mono text-xs">{username || t("account")}</span>
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
      <nav className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-border bg-background/70 py-2 pl-4 pr-2 shadow-sm backdrop-blur-md">
        <Link className="transition-opacity hover:opacity-70" href="/">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-0.5">
          <ExternalLink
            className="flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            href="https://github.com/kapeka0/ctf-archives-frontend"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="size-4" />
          </ExternalLink>
          <ThemeToggle />
          <LangToggle />
          <Unauthenticated>
            <Link href="/sign-in">
              <Button className="ml-1 h-7 rounded-full px-3 text-xs" size="sm">
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
