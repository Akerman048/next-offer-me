import Link from "next/link";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { topicIcons, topicColors } from "@/lib/topic-icons";
import { SiJavascript } from "react-icons/si";

const Topics = async () => {
  const [session, topics] = await Promise.all([
    auth(),
    prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const isAdmin = isAdminEmail(session?.user?.email);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            Interview practice
          </p>

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
                Interview Topics
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Choose a topic and practice structured frontend interview
                questions with lessons, answers, and AI feedback.
              </p>
            </div>

            <Link
              href="/interview"
              className="inline-flex items-center justify-center rounded-2xl bg-violet-500 px-7 py-4 font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-400"
            >
              Start mock interview
              <span className="ml-3 text-xl">›</span>
            </Link>
          </div>
        </section>

        {topics.length === 0 ? (
          <section className="rounded-[28px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-3xl text-violet-300">
              📚
            </div>

            <h2 className="mt-6 text-3xl font-black text-white">
              No topics yet
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
              {isAdmin
                ? "Add topics from the admin panel to start building your interview library."
                : "Topics will appear here once the interview library is ready."}
            </p>

            {isAdmin ? (
              <Link
                href="/admin/topics"
                className="mt-6 inline-flex rounded-2xl bg-violet-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Go to admin
              </Link>
            ) : (
              <p className="mt-6 text-sm text-slate-500">
                Topics will appear here once they are published.
              </p>
            )}
          </section>
        ) : (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-3 text-3xl font-black text-white">
                  <span className="text-violet-400">📚</span>
                  All topics
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Select a topic to continue learning.
                </p>
              </div>

              <span className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 backdrop-blur-xl">
                {topics.length} topics
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const Icon =
                  topicIcons[topic.slug as keyof typeof topicIcons] ??
                  SiJavascript;

                const color =
                  topicColors[topic.slug as keyof typeof topicColors] ??
                  "#A855F7";

                return (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.slug}`}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />

                    <div className="relative">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl shadow-lg">
                          <Icon size={30} color={color} />
                        </div>

                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                          Topic
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-white transition group-hover:text-violet-200">
                        {topic.name}
                      </h3>

                      <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                        Practice interview questions and review learning
                        materials.
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="text-sm font-bold text-slate-200">
                          Start learning
                        </span>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/30 text-xl text-violet-200 transition group-hover:bg-violet-500 group-hover:text-white">
                          ›
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default Topics;
