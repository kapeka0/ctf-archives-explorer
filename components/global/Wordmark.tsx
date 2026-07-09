import { cn } from "@/lib/utils";

/**
 * The site signature: identity rendered in the CTF flag format, `ctf{archives}`.
 * The braces and inner token carry the accent; everything else stays ink.
 */
function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-mono text-sm font-medium tracking-tight", className)}>
      ctf<span className="text-brand">{"{"}</span>
      archives
      <span className="text-brand">{"}"}</span>
    </span>
  );
}

export default Wordmark;
