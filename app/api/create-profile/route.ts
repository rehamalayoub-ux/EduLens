import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Role is always "supervisor" — not accepted from client input
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        full_name: user.user_metadata?.full_name ?? "",
        role: "supervisor",
      },
      { onConflict: "user_id" }
    );

    if (error) {
      return NextResponse.json({ error: "Profile creation failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Demo mode
    return NextResponse.json({ ok: true });
  }
}
