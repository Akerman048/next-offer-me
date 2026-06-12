import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <section className="py-4 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-muted">
            AI Interview Trainer
          </p>

          <h1 className="mb-8 text-6xl font-bold leading-tight">
            Prepare for your
            <br />
            developer interview 🚀
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg text-muted">
            Practice JavaScript, React, Next.js, TypeScript, Node.js and
            databases with AI feedback, personalized roadmaps and realistic
            interview simulations.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/topics"
              className="rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground transition hover:scale-[1.03]"
            >
              Start learning →
            </Link>

            <Link
              href="/interview"
              className="rounded-2xl border border-border bg-card px-8 py-4 font-semibold transition hover:bg-card-hover"
            >
              Try interview mode
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-4 text-4xl">📚</div>

            <h2 className="mb-3 text-2xl font-semibold">
              Question Library
            </h2>

            <p className="text-muted">
              Learn from structured lessons and questions grouped by topic and
              difficulty.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-4 text-4xl">📈</div>

            <h2 className="mb-3 text-2xl font-semibold">
              Progress Tracking
            </h2>

            <p className="text-muted">
              Track completed lessons, identify weak areas and monitor your
              preparation.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
            <div className="mb-4 text-4xl">🤖</div>

            <h2 className="mb-3 text-2xl font-semibold">
              AI Interview Mode
            </h2>

            <p className="text-muted">
              Answer real interview questions and receive detailed AI feedback
              and improvement suggestions.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-24 rounded-[2rem] border border-border bg-card p-12 text-center shadow-2xl">
          <h2 className="mb-4 text-4xl font-bold">
            Ready to get hired? 💼
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-muted">
            Build confidence, improve your interview skills and prepare with
            personalized AI-generated roadmaps.
          </p>

          <Link
            href="/interview"
            className="inline-block rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground transition hover:scale-[1.03]"
          >
            Start Interview Training
          </Link>
        </section>
      </div>
    </main>
  );
}