import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();
    let code = "unknown";
    if (msg.includes("invalid") || msg.includes("credentials")) code = "invalid";
    else if (msg.includes("confirmed")) code = "unconfirmed";
    else if (msg.includes("many")) code = "ratelimit";
    return NextResponse.redirect(`${origin}/login?error=${code}`, { status: 303 });
  }

  return supabaseResponse;
}
