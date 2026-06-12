import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-50 border-b border-[#fff3da]/10 bg-[#041325]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff3da] text-[#041325]">
            🚀
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#fff3da]">Get Hired</h1>

            <p className="text-xs text-[#fff3da]/50">AI Interview Trainer</p>
          </div>
        </Link>

        {/* Navigation */}
        {isLoggedIn && (
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-[#fff3da]/80 transition hover:bg-[#fff3da]/10 hover:text-[#fff3da]"
            >
              Dashboard
            </Link>

            <Link
              href="/topics"
              className="rounded-xl px-4 py-2 text-[#fff3da]/80 transition hover:bg-[#fff3da]/10 hover:text-[#fff3da]"
            >
              Learn
            </Link>

            <Link
              href="/interview"
              className="rounded-xl px-4 py-2 text-[#fff3da]/80 transition hover:bg-[#fff3da]/10 hover:text-[#fff3da]"
            >
              Interview
            </Link>

            <Link
              href="/roadmaps"
              className="rounded-xl px-4 py-2 text-[#fff3da]/80 transition hover:bg-[#fff3da]/10 hover:text-[#fff3da]"
            >
              Roadmaps
            </Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin/topics"
              className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 font-medium text-yellow-300 transition hover:bg-yellow-500/20"
            >
              Admin
            </Link>
          )}

          {session?.user ? (
            <form action={logout}>
              <button className="rounded-2xl border border-[#fff3da]/20 bg-[#fff3da]/10 px-5 py-2 font-medium text-[#fff3da] transition hover:bg-[#fff3da] hover:text-[#041325]">
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl bg-[#fff3da] px-5 py-2 font-semibold text-[#041325] transition hover:scale-[1.03]"
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
