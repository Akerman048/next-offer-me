type Props = {
  title?: string;
  description?: string;
};

export default function PageLoading({
  title = "Loading...",
  description = "Preparing your content.",
}: Props) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 text-foreground">
      <div className="pointer-events-none absolute left-[-120px] top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute right-[-140px] top-10 h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <section className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#17164a] via-[#11194b] to-[#08142d] p-10 shadow-2xl shadow-violet-950/30">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-violet-400/10" />

          <div className="mb-6 h-4 w-40 animate-pulse rounded-full bg-white/10" />

          <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-white/10" />

          <div className="mt-5 h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-white/10" />
              </div>

              <div className="h-7 w-3/4 animate-pulse rounded-xl bg-white/10" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </section>

        <p className="mt-8 text-center text-sm text-slate-400">
          {title} · {description}
        </p>
      </div>
    </main>
  );
}