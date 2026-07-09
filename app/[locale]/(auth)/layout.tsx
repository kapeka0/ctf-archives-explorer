import AuthNavbar from "./_components/AuthNavbar";

type Props = {
  readonly children: React.ReactNode;
};

async function AuthLayout({ children }: Props) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 text-pretty">
      <AuthNavbar />
      {children}
    </div>
  );
}

export default AuthLayout;
