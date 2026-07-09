import LangToggle from "@/components/global/LangToggle";
import { ThemeToggle } from "@/components/global/ThemeToggle";
import Wordmark from "@/components/global/Wordmark";
import { Link } from "@/i18n/routing";

function AuthNavbar() {
  return (
    <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between p-5">
      <Link className="transition-opacity hover:opacity-70" href="/">
        <Wordmark />
      </Link>
      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <LangToggle />
      </div>
    </div>
  );
}

export default AuthNavbar;
