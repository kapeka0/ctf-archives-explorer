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
      <footer className="border-t py-6">
        <MaxWidthWrapper className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <ExternalLink
            className="hover:text-foreground hover:underline"
            href={ARCHIVE_REPO}
            rel="noopener noreferrer"
            target="_blank"
          >
            sajjadium/ctf-archives
          </ExternalLink>
          <ExternalLink
            className="hover:text-foreground hover:underline"
            href="https://github.com/kapeka0/kapeka-starter-kit"
            rel="noopener noreferrer"
            target="_blank"
          >
            kapeka-starter-kit
          </ExternalLink>
        </MaxWidthWrapper>
      </footer>
    </div>
  );
}

export default SiteLayout;
