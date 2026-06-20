import Link from "next/link";
import { ReactNode } from "react";

export function Surface({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`soft-panel rounded-[30px] p-5 sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-sage">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-2xl font-bold text-ink">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/70">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function InfoPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-cream px-3 py-1 text-xs font-bold text-ink/75">
      {children}
    </span>
  );
}

export function PrimaryLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px] hover:bg-[#8cab99]"
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
    >
      {children}
    </Link>
  );
}
