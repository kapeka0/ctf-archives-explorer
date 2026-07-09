"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowUpRight, Bookmark, X } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/routing";
import { githubTreeUrl } from "@/lib/ctf/types";

function SavedPage() {
  const t = useTranslations("Saved");
  const favorites = useQuery(api.favorites.all);
  const toggle = useMutation(api.favorites.toggle);

  const grouped = new Map<string, { ctfSlug: string; key: string }[]>();
  for (const f of favorites ?? []) {
    const list = grouped.get(f.ctfSlug);
    if (list) list.push(f);
    else grouped.set(f.ctfSlug, [f]);
  }

  const handleRemove = async (ctfSlug: string, key: string) => {
    try {
      await toggle({ ctfSlug, key });
      toast.success(t("removed"));
    } catch {
      toast.error(t("removeError"));
    }
  };

  return (
    <MaxWidthWrapper className="py-10">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>

      {(!favorites || favorites.length === 0) ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Bookmark className="size-10 text-muted-foreground/30" />
          <p className="max-w-sm text-lg text-muted-foreground">{t("empty")}</p>
          <Link href="/">
            <Button variant="outline" size="sm">
              {t("browseCta")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {[...grouped.entries()].map(([ctfSlug, items]) => (
            <section key={ctfSlug}>
              <div className="mb-3 flex items-center gap-2">
                <Link
                  className="font-mono text-lg font-semibold tracking-tight transition-colors hover:text-brand"
                  href={`/ctf/${ctfSlug}`}
                >
                  {ctfSlug}
                </Link>
                <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const name = item.key.split("/").pop() ?? item.key;
                  return (
                    <div
                      className="group flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-brand/50"
                      key={item.key}
                    >
                      <Bookmark className="size-3.5 shrink-0 fill-current text-brand" />
                      <ExternalLink
                        className="truncate font-mono text-sm text-foreground/90 transition-colors hover:text-brand"
                        href={githubTreeUrl(item.key)}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        {name}
                      </ExternalLink>
                      <ExternalLink
                        className="ml-auto text-muted-foreground/40 transition-colors hover:text-brand"
                        href={githubTreeUrl(item.key)}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <ArrowUpRight className="size-3" />
                      </ExternalLink>
                      <button
                        className="shrink-0 rounded p-0.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemove(item.ctfSlug, item.key)}
                        title={t("remove")}
                        type="button"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </MaxWidthWrapper>
  );
}

export default SavedPage;
