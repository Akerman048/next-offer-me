import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/app/actions/auth";

export async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.email;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          Get Hired
        </Link>

        {/* Main Navigation */}
        {isLoggedIn && (
          <div className="flex items-center gap-6">
            <Link href="/dashboard">Dashboard</Link>

            <Link href="/topics">Learn</Link>

            <Link href="/interview">Interview</Link>
            <Link href="/roadmaps">Roadmaps</Link>

            <Link href="/search">Search</Link>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link
              href="/admin/topics"
              className="rounded-lg bg-gray-100 px-4 py-2"
            >
              Admin
            </Link>
          )}

          {session?.user ? (
            <form action={logout}>
              <button className="rounded-lg border px-4 py-2">Logout</button>
            </form>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
