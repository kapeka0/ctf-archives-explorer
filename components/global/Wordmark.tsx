import Logo from "@/components/global/Logo";
import { cn } from "@/lib/utils";

/** The flag mark plus the project name. */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Logo className="size-5 rounded-[6px]" />
      <span className="text-sm font-semibold tracking-tight">CTF Archive</span>
    </span>
  );
}

export default Wordmark;
