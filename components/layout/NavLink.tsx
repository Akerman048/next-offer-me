"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children }: Props) {
  const pathname = usePathname();

  const isActive =
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={clsx(
        "rounded-xl px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted hover:bg-card-hover hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}