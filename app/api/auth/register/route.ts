import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const email    = formData.get("email")     as string;
  const password = formData.get("password")  as string;
  const fullName = formData.get("fullName")  as string;

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
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    let code = "unknown";
    if (msg.includes("already") || msg.includes("exists")) code = "exists";
    else if (msg.includes("password")) code = "weak_password";
    return NextResponse.redirect(`${origin}/register?error=${code}`, { status: 303 });
  }

  // Auto-confirmed (trigger enabled) — session is ready
  if (data.session) {
    return supabaseResponse;
  }

  // No session yet — redirect to login with success message
  return NextResponse.redirect(`${origin}/login?registered=1`, { status: 303 });
}
