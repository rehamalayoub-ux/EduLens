import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const formData = await request.formData();
    const email    = (formData.get("email")    as string ?? "").trim();
    const password = (formData.get("password") as string ?? "").trim();
    const fullName = (formData.get("fullName") as string ?? "").trim();

    if (!email || !password || password.length < 8) {
      return NextResponse.redirect(`${origin}/register?error=weak_password`, { status: 303 });
    }

    const cookieStore = await cookies();
    let supabaseResponse = NextResponse.redirect(`${origin}/dashboard`, { status: 303 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // No emailRedirectTo — auto-confirm trigger handles confirmation
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      let code = "unknown";
      if (msg.includes("already") || msg.includes("exists")) code = "exists";
      else if (msg.includes("password"))                      code = "weak_password";
      else if (msg.includes("invalid email"))                 code = "invalid_email";
      // Pass actual message for debugging
      const detail = encodeURIComponent(error.message.slice(0, 100));
      return NextResponse.redirect(`${origin}/register?error=${code}&detail=${detail}`, { status: 303 });
    }

    // Auto-confirm trigger fires immediately → session should be present
    if (data.session) {
      return supabaseResponse;
    }

    // Fallback: no session yet, go to login
    return NextResponse.redirect(`${origin}/login?registered=1`, { status: 303 });

  } catch (err) {
    const detail = encodeURIComponent(String(err).slice(0, 100));
    return NextResponse.redirect(`${origin}/register?error=server&detail=${detail}`, { status: 303 });
  }
}
