import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";
import NavLink from "@/components/layout/NavLink";

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

        {isLoggedIn && (
          <div className="hidden items-center gap-6 md:flex">
            <NavLink href="/dashboard">Dashboard</NavLink>

            <NavLink href="/topics">Learn</NavLink>

            <NavLink href="/interview">Interview</NavLink>

            <NavLink href="/roadmaps">Roadmaps</NavLink>
          </div>
        )}

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/topics"
              className="rounded-2xl bg-violet-600/30 px-5 py-2.5 text-sm font-semibold text-violet-200 shadow-lg shadow-violet-500/20 transition hover:bg-violet-600/50"
            >
              Admin
            </Link>
          )}

          {session?.user ? (
            <form action={logout}>
              <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
                Logout →
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-violet-400"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
