import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function syncProfile() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error("Session error:", sessionError.message);
    return;
  }

  const user = sessionData?.session?.user;
  if (!user) {
    console.warn("No logged-in user found for syncProfile.");
    return;
  }

  const { error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email,
        plan: "free", // default plan
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (upsertError) console.error("Error saving user:", upsertError.message);
  else console.log("User synced successfully:", user.email);
}
