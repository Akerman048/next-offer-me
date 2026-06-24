"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import clsx from "clsx";
import { logout } from "@/app/actions/auth";
import NavLink from "@/components/layout/NavLink";

type Props = {
  isAdmin: boolean;
  isLoggedIn: boolean;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/topics", label: "Learn" },
  { href: "/interview", label: "Interview" },
  { href: "/roadmaps", label: "Roadmaps" },
];

export default function HeaderMenu({ isAdmin, isLoggedIn }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-3">
      {isLoggedIn && (
        <div className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}

      <div className="hidden items-center gap-3 md:flex">
        {isAdmin && (
          <Link
            href="/admin/topics"
            className="rounded-2xl bg-violet-600/30 px-5 py-2.5 text-sm font-semibold text-violet-200 shadow-lg shadow-violet-500/20 transition hover:bg-violet-600/50"
          >
            Admin
          </Link>
        )}

        {isLoggedIn ? (
          <form action={logout}>
            <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
              Logout →
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="rounded-2xl bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.03] hover:bg-violet-400"
          >
            Login
          </Link>
        )}
      </div>

      <div className="relative md:hidden">
        <button
          type="button"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-xl text-slate-100 transition hover:bg-white/10"
        >
          {isOpen ? <FiX aria-hidden /> : <FiMenu aria-hidden />}
        </button>

        {isOpen && (
          <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col p-2">
              {isLoggedIn ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={clsx(
                        "rounded-xl px-4 py-2 text-sm font-medium transition",
                        pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted hover:bg-card-hover hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {isAdmin && (
                    <Link
                      href="/admin/topics"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-violet-200 transition hover:bg-card-hover hover:text-white"
                    >
                      Admin
                    </Link>
                  )}

                  <form action={logout} className="mt-2 border-t border-white/10 pt-2">
                    <button className="w-full rounded-xl px-4 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-card-hover hover:text-white">
                      Logout →
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
