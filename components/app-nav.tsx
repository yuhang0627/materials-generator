"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  match?: string[];
};

export type NavGroup = {
  heading?: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    items: [{ href: "/dashboard", label: "Dashboard", icon: "🏠" }]
  },
  {
    heading: "Create",
    items: [
      {
        href: "/materials/create",
        label: "Create Material",
        icon: "🎨",
        match: ["/materials/create", "/materials/result"]
      },
      { href: "/toolkit", label: "EIP Toolkit", icon: "🧰" },
      { href: "/theme-packs", label: "Theme Packs", icon: "📦" }
    ]
  },
  {
    heading: "Plan",
    items: [
      { href: "/theme-planner", label: "Theme Planner", icon: "🗓️" },
      { href: "/plans/create", label: "Teaching Plans", icon: "📋" }
    ]
  },
  {
    heading: "Discover",
    items: [{ href: "/ideas", label: "Activity Ideas", icon: "💡" }]
  },
  {
    heading: "Saved",
    items: [
      { href: "/library", label: "Resource Library", icon: "📚" },
      { href: "/history", label: "History", icon: "🕘" }
    ]
  }
];

function isActive(pathname: string, item: NavItem) {
  const targets = item.match ?? [item.href];
  return targets.some(
    (target) => pathname === target || pathname.startsWith(`${target}/`)
  );
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-sage to-[#8cab99] text-2xl shadow-sm">
        🌱
      </span>
      <span>
        <span className="block font-display text-lg font-bold leading-tight text-ink">
          Teaching Studio
        </span>
        <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-sage">
          EIP Assistant
        </span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {navGroups.map((group, groupIndex) => (
        <div key={group.heading ?? `group-${groupIndex}`}>
          {group.heading ? (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/40">
              {group.heading}
            </p>
          ) : null}
          <div className="space-y-1.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-sage text-white shadow-sm"
                      : "text-ink/80 hover:bg-mint/50 hover:text-ink"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-base ${
                      active ? "bg-white/20" : "bg-white/70"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

/** Desktop sidebar navigation. */
export function DesktopNav() {
  return (
    <aside className="soft-panel hidden w-72 shrink-0 flex-col rounded-[32px] p-5 lg:flex">
      <div className="px-1 pb-5">
        <Brand />
      </div>

      <NavLinks />

      <div className="mt-auto rounded-[24px] bg-gradient-to-br from-cream to-blush p-4">
        <p className="font-display text-base font-semibold text-ink">
          Teacher tip
        </p>
        <p className="mt-1.5 text-xs leading-6 text-ink/70">
          Start with small batches, reuse strong templates, and keep wording
          concrete for easier student access.
        </p>
      </div>
    </aside>
  );
}

/** Mobile/tablet top navigation with a collapsible menu. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="soft-panel rounded-[26px] p-4 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-xl text-ink transition hover:bg-cream"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 border-t border-sage/15 pt-4">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
