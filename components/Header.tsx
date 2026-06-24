import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import HeaderMenu from "@/components/layout/HeaderMenu";
import logo from "@/app/logo.png";

export async function Header() {
  const session = await auth();

  const isLoggedIn = !!session?.user?.email;
  const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-0">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden">
            <Image
              src={logo}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Get Hired
            </h1>
            <p className="text-xs text-slate-400">AI Interview Trainer</p>
          </div>
        </Link>

        <HeaderMenu isAdmin={isAdmin} isLoggedIn={isLoggedIn} />
      </nav>
    </header>
  );
}
