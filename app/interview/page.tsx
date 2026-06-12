import { prisma } from "@/lib/prisma";
import { Level } from "@/generated/prisma/enums";
import { startInterview } from "./actions";

export default async function InterviewPage() {
  const topics = await prisma.topic.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-16 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-96 top-20 h-2 w-2 rounded-full bg-violet-400/30" />

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.32em] text-violet-400">
            Mock interview
          </p>

          <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">
            Interview Training
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Choose your mode, topics, level, and question count. Your answers
            will be evaluated by AI after the interview.
          </p>
        </section>

        <form
          action={startInterview}
          className="rounded-[32px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="mb-6 rounded-[28px] border border-white/10 bg-background/60 p-5">
            <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-violet-400">
              Mode
            </label>

            <select
              name="mode"
              className="w-full rounded-2xl border border-white/10 bg-[#071024] p-4 text-sm font-semibold text-white outline-none transition focus:border-violet-400"
            >
              <option value="PRACTICE">Practice · no pressure</option>
              <option value="REAL">Real interview · 90 sec/question</option>
              <option value="HARD">Hard mode · 60 sec/question</option>
            </select>
          </div>

          <div className="mb-6 rounded-[28px] border border-white/10 bg-background/60 p-5">
            <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-violet-400">
              Topics
            </label>

            <p className="mb-5 text-sm text-slate-400">
              Leave empty to use all topics.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {topics.map((topic) => (
                <label
                  key={topic.id}
                  className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                >
                  <input
                    type="checkbox"
                    name="topics"
                    value={topic.slug}
                    className="h-4 w-4 accent-violet-500"
                  />

                  <span>{topic.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-background/60 p-5">
              <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-violet-400">
                Level
              </label>

              <select
                name="level"
                className="w-full rounded-2xl border border-white/10 bg-[#071024] p-4 text-sm font-semibold text-white outline-none transition focus:border-violet-400"
              >
                <option value="">All levels</option>
                <option value={Level.JUNIOR}>Junior</option>
                <option value={Level.MIDDLE}>Middle</option>
                <option value={Level.SENIOR}>Senior</option>
              </select>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-background/60 p-5">
              <label className="mb-3 block text-sm font-bold uppercase tracking-[0.22em] text-violet-400">
                Number of questions
              </label>

              <select
                name="questionCount"
                defaultValue="5"
                className="w-full rounded-2xl border border-white/10 bg-[#071024] p-4 text-sm font-semibold text-white outline-none transition focus:border-violet-400"
              >
                <option value="5">5 questions · about 8 minutes</option>
                <option value="10">10 questions · about 15 minutes</option>
                <option value="15">15 questions · about 23 minutes</option>
                <option value="20">20 questions · about 30 minutes</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="group flex w-full items-center justify-center gap-3 rounded-[28px] bg-violet-500 px-6 py-5 text-lg font-black text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
          >
            Start interview

            <span className="text-2xl transition group-hover:translate-x-1">
              ›
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}