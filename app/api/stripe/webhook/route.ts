import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Ensure this runs on Node (needed to verify signatures)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20" as any, // ✅ Fixed version
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature" },
        { status: 400 }
      );
    }

    const body = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.client_reference_id;
      const email =
        session.customer_email ||
        (typeof session.customer_details?.email === "string"
          ? session.customer_details.email
          : undefined);

      // ✅ Updated logic: prioritize userId, fallback to email
      if (userId) {
        await supabase
          .from("profiles")
          .update({ plan: "premium" })
          .eq("id", userId);
        console.log("✅ Premium access granted via userId:", userId);
      } else if (email) {
        await supabase
          .from("profiles")
          .update({ plan: "premium" })
          .eq("email", email);
        console.log("✅ Premium access granted via email:", email);
      }
    }

    // (Optional) handle downgrades later:
    // if (event.type === "customer.subscription.deleted") ...

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook Error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
