import { loginWithGithubBtn, loginWithGoogleBtn } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-2xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-muted">
            Welcome back
          </p>

          <h1 className="text-5xl font-bold">
            Login 🚀
          </h1>

          <p className="mt-4 text-muted">
            Continue to Get Hired and keep preparing for your next developer
            interview.
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <form action={loginWithGithubBtn}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-4 font-semibold text-primary-foreground transition hover:scale-[1.02]"
            >
              <span className="text-xl">🐙</span>
              Continue with GitHub
            </button>
          </form>

          <form action={loginWithGoogleBtn}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-secondary px-5 py-4 font-semibold transition hover:bg-card-hover"
            >
              <span className="text-xl">🌐</span>
              Continue with Google
            </button>
          </form>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted">
          AI Interview Trainer · Learn · Practice · Get Hired 💼
        </div>
      </div>
    </main>
  );
}