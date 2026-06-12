import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-40 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] px-8 py-24 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full border border-violet-400/10" />
          <div className="pointer-events-none absolute right-28 top-20 h-2 w-2 rounded-full bg-violet-400/30" />
          <div className="pointer-events-none absolute right-80 top-36 h-2 w-2 rounded-full bg-violet-400/30" />

          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-5 py-2 text-sm font-bold text-violet-200">
              🚀 AI Interview Trainer
            </div>

            <h1 className="text-6xl font-black leading-tight text-white md:text-8xl">
              Prepare for your
              <br />
              developer interview
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-300">
              Practice JavaScript, React, Next.js, TypeScript, Node.js and
              databases with AI feedback, personalized roadmaps and realistic
              interview simulations.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-5">
              <Link
                href="/topics"
                className="inline-flex items-center rounded-2xl bg-violet-500 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
              >
                Start learning
                <span className="ml-3 text-2xl">›</span>
              </Link>

              <Link
                href="/interview"
                className="inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-8 py-5 text-lg font-bold text-white backdrop-blur-xl transition hover:bg-white/10"
              >
                Try interview mode
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="group rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-4xl text-violet-300">
              📚
            </div>

            <h2 className="text-3xl font-black text-white">
              Question Library
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Learn from structured lessons and questions grouped by topic and
              difficulty.
            </p>
          </div>

          <div className="group rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-4xl text-blue-300">
              📈
            </div>

            <h2 className="text-3xl font-black text-white">
              Progress Tracking
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Track completed lessons, identify weak areas and monitor your
              preparation.
            </p>
          </div>

          <div className="group rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:bg-card-hover">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-4xl text-emerald-300">
              🤖
            </div>

            <h2 className="text-3xl font-black text-white">
              AI Interview Mode
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              Answer real interview questions and receive detailed AI feedback
              and improvement suggestions.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">Topics</p>

            <h2 className="mt-3 text-5xl font-black text-white">10+</h2>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">Interview questions</p>

            <h2 className="mt-3 text-5xl font-black text-white">500+</h2>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <p className="text-sm text-slate-400">AI feedback</p>

            <h2 className="mt-3 text-5xl font-black text-white">∞</h2>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-10 mb-10 overflow-hidden rounded-[40px] border border-white/10 bg-card p-14 text-center shadow-2xl backdrop-blur-xl">
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-96 rounded-full bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-emerald-500/20 blur-3xl" />

          <div className="relative">
            <h2 className="text-5xl font-black text-white">
              Ready to get hired? 💼
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Build confidence, improve your interview skills and prepare with
              personalized AI-generated roadmaps.
            </p>

            <Link
              href="/interview"
              className="mt-10 inline-flex items-center rounded-2xl bg-violet-500 px-8 py-5 text-lg font-black text-white shadow-2xl shadow-violet-500/25 transition hover:-translate-y-1 hover:bg-violet-400"
            >
              Start Interview Training
              <span className="ml-3 text-2xl">›</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}