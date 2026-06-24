import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const isAdmin = isAdminEmail(session?.user?.email);

  if (!isAdmin) {
    redirect(isLoggedIn ? "/dashboard" : "/login");
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute left-[-140px] top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-160px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-40 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <aside className="relative z-10 hidden w-72 shrink-0 border-r border-white/10 bg-[#071024]/80 p-6 shadow-2xl backdrop-blur-xl md:block">
        <Link href="/dashboard" className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-lg">
            🚀
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Admin
            </h2>
            <p className="text-xs text-slate-400">Control panel</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-3">
          <Link
            href="/admin/topics"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-violet-600/25 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-lg text-violet-300">
              📚
            </span>
            Topics
          </Link>

          <Link
            href="/admin/lessons"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-violet-600/25 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-lg text-blue-300">
              📖
            </span>
            Lessons
          </Link>

          <Link
            href="/admin/parts"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-violet-600/25 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-lg text-emerald-300">
              🧩
            </span>
            Parts
          </Link>

          <Link
            href="/admin/questions"
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-violet-600/25 hover:text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/15 text-lg text-pink-300">
              ❓
            </span>
            Questions
          </Link>
        </nav>

        <div className="mt-10 rounded-[24px] border border-white/10 bg-gradient-to-br from-violet-600/20 to-blue-600/10 p-5">
          <p className="text-sm font-bold text-white">Admin tools</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Manage topics, lessons, lesson parts and interview questions.
          </p>
        </div>
      </aside>

      <section className="relative z-10 flex-1 p-4 md:p-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.28em] text-violet-400">
            Admin dashboard
          </p>

          <h1 className="mt-3 text-4xl font-black text-white">
            Content Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Create and edit learning content for your AI interview trainer.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </section>
    </main>
  );
}
