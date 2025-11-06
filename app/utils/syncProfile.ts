import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function syncProfile() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    console.log("No user logged in yet");
    return;
  }

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    plan: "free"
  });

  if (error) {
    console.log("PROFILE UPSERT ERROR:", error);
  } else {
    console.log("PROFILE SYNCED ✅");
  }
}
