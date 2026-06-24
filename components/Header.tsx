import Link from "next/link";
import { auth } from "@/auth";
import HeaderMenu from "@/components/layout/HeaderMenu";

export async function Header() {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-lg">
            🚀
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Get Hired
            </h1>
            <p className="text-xs text-slate-400">AI Interview Trainer</p>
          </div>
        </Link>

        <HeaderMenu isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
      </nav>
    </header>
  );
}
