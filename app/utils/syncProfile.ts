import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This ensures every logged-in user has a record in the 'profiles' table
export async function syncProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    plan: "free", // default plan for new users
  });
}
