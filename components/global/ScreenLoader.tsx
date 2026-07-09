import Logo from "@/components/global/Logo";

/** Full-screen loader with the flag mark pulsing in the middle. */
function ScreenLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Logo className="size-10 animate-pulse rounded-[10px]" />
    </div>
  );
}

export default ScreenLoader;
