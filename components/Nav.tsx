import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/today", label: "Today" },
  { href: "/curriculum", label: "Curriculum" },
  { href: "/weekly", label: "Weekly" },
  { href: "/monthly", label: "Monthly" },
  { href: "/history", label: "History" },
];

export function Nav() {
  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          AI Learning Tracker
        </Link>
        <div className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
