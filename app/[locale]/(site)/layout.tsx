import SiteNavbar from "@/components/global/SiteNavbar";
import ExternalLink from "@/components/ui/external-link";
import MaxWidthWrapper from "@/components/ui/MaxWidthWrapper";
import { ARCHIVE_REPO } from "@/lib/ctf/types";

type Props = {
  readonly children: React.ReactNode;
};

function SiteLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNavbar />
      <div className="flex-1">{children}</div>
      <footer className="mt-10 border-t border-border py-6">
        <MaxWidthWrapper className="flex flex-col items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground sm:flex-row">
          <span>
            Data ·{" "}
            <ExternalLink
              className="text-foreground/80 transition-colors hover:text-brand"
              href={ARCHIVE_REPO}
              rel="noopener noreferrer"
              target="_blank"
            >
              sajjadium/ctf-archives
            </ExternalLink>
          </span>
          <ExternalLink
            className="transition-colors hover:text-brand"
            href="https://github.com/kapeka0/ctf-archives-explorer"
            rel="noopener noreferrer"
            target="_blank"
          >
            source
          </ExternalLink>
        </MaxWidthWrapper>
      </footer>
    </div>
  );
}

export default SiteLayout;
