import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function syncProfile() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email,
          plan: "free",
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (error) console.error("Sync error:", error);
    else console.log("✅ Profile synced successfully:", user.email);
  } catch (err) {
    console.error("SyncProfile failed:", err);
  }
}
