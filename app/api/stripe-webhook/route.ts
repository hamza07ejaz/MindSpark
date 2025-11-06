import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
    }

    const body = await req.text();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Handle subscription success or completed checkout
    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;

      // Identify user by client_reference_id (from checkout creation)
      const userId = session.client_reference_id;

      if (userId) {
        const { error } = await supabase
          .from("profiles")
          .update({ plan: "premium" })
          .eq("id", userId);

        if (error) console.error("Supabase update error:", error);
        else console.log(`✅ Updated user ${userId} to premium`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error("Webhook Error:", err.message || err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
