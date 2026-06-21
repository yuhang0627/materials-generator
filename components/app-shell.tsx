import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/materials/create", label: "Create Material" },
  { href: "/toolkit", label: "EIP Toolkit" },
  { href: "/theme-packs", label: "Theme Packs" },
  { href: "/theme-planner", label: "Theme Planner" },
  { href: "/plans/create", label: "Teaching Plan Generator" },
  { href: "/ideas", label: "Search Mode" },
  { href: "/library", label: "Resource Library" },
  { href: "/materials/result", label: "Generated Result" },
  { href: "/history", label: "History" }
];

type AppShellProps = {
  children: ReactNode;
  title: string;
  description: string;
  userEmail?: string;
  headerAction?: ReactNode;
};

export function AppShell({
  children,
  title,
  description,
  userEmail,
  headerAction
}: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-5rem] top-10 h-40 w-40 rounded-full bg-mint/50 blur-3xl" />
        <div className="absolute right-0 top-32 h-56 w-56 animate-drift rounded-full bg-blush/70 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-40 w-40 rounded-full bg-lilac/55 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl gap-5 lg:gap-8">
        <aside className="soft-panel hidden w-72 shrink-0 rounded-[32px] p-6 lg:block">
          <div className="mb-8">
            <p className="font-display text-2xl font-bold text-ink">
              Teaching Materials
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              A calm private workspace for thoughtful, student-friendly prep.
            </p>
          </div>

          <nav className="space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mint/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-[28px] bg-gradient-to-br from-cream to-blush p-5">
            <p className="font-display text-lg font-semibold text-ink">
              Teacher Notes
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Start with small batches, reuse strong templates, and keep wording
              concrete for easier student access.
            </p>
          </div>
        </aside>

        <main className="w-full">
          <div className="soft-panel rounded-[30px] p-5 sm:p-6 lg:hidden">
            <p className="font-display text-xl font-bold text-ink">
              Teaching Materials
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <header className="mb-5 mt-5 rounded-[30px] bg-gentle-radial p-6 sm:mb-6 sm:mt-0 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sage">
                  Private Teacher Tool
                </p>
                <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70 sm:text-base">
                  {description}
                </p>
              </div>

              <div className="soft-panel flex items-center gap-4 rounded-[24px] px-4 py-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint text-lg font-bold text-ink">
                  {(userEmail?.charAt(0) ?? "T").toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {userEmail ?? "Teacher"}
                  </p>
                  <p className="text-xs text-ink/65">
                    Early Intervention Program teacher
                  </p>
                </div>
                {headerAction ? <div className="ml-2">{headerAction}</div> : null}
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
