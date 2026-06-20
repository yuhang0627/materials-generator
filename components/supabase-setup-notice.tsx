import { Surface, SectionTitle } from "@/components/ui";

export function SupabaseSetupNotice() {
  return (
    <Surface>
      <SectionTitle
        eyebrow="Setup Needed"
        title="Supabase environment variables are not configured yet"
        description="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the dev server."
      />
      <div className="rounded-[24px] bg-white/80 p-4 text-sm leading-7 text-ink/75">
        <p>1. Create a Supabase project.</p>
        <p>2. Copy `.env.example` to `.env.local`.</p>
        <p>3. Paste your project URL and publishable key.</p>
        <p>4. Run the SQL in `supabase/materials.sql`.</p>
        <p>5. Restart `npm run dev`.</p>
      </div>
    </Surface>
  );
}
