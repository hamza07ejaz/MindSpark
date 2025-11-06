import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Returns "premium" or "free"
export async function getUserPlan() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) return "free";

  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", session.user.id)
    .single();

  if (error || !data?.plan) {
    console.error("Failed to fetch user plan:", error?.message || "unknown");
    return "free";
  }

  return data.plan;
}
