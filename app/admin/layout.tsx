import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-card p-6">
        <h2 className="mb-6 text-2xl font-bold">
          Admin
        </h2>

        <nav className="flex flex-col gap-3">


          <Link
            href="/admin/topics"
            className="rounded-xl px-4 py-3 text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            Topics
          </Link>

          <Link
            href="/admin/lessons"
            className="rounded-xl px-4 py-3 text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            Lessons
          </Link>

          <Link
            href="/admin/parts"
            className="rounded-xl px-4 py-3 text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            Parts
          </Link>

          <Link
            href="/admin/questions"
            className="rounded-xl px-4 py-3 text-muted transition hover:bg-card-hover hover:text-foreground"
          >
            Questions
          </Link>
        </nav>
      </aside>

      <section className="flex-1 bg-background p-8">
        {children}
      </section>
    </main>
  );
}