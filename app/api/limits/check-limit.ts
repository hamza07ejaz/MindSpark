import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Checks if user exceeded free limits
export async function checkFreeLimits(userId: string, type: "note" | "qna") {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error || !profile) return { allowed: false, error }

  // Reset daily if needed
  const today = new Date().toISOString().split("T")[0]
  if (profile.last_reset !== today) {
    await supabase
      .from("profiles")
      .update({ notes_today: 0, qna_today: 0, last_reset: today })
      .eq("id", userId)
  }

  if (profile.plan === "premium") return { allowed: true }

  if (type === "note" && profile.notes_today >= 2)
    return { allowed: false, reason: "Free users can only create 2 notes per day." }

  if (type === "qna" && profile.qna_today >= 1)
    return { allowed: false, reason: "Free users can only create 1 Q&A per day." }

  return { allowed: true }
}

// Increment counter after successful usage
export async function incrementUsage(userId: string, type: "note" | "qna") {
  const column = type === "note" ? "notes_today" : "qna_today"
  await supabase.rpc("increment_counter", { user_id: userId, column_name: column })
}
