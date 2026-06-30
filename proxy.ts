import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  // If Supabase is not configured yet, allow all routes (dev/preview mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.startsWith("your-")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Allow demo session (bypass Supabase auth)
  const demoSession = request.cookies.get("x-demo-session")?.value;
  if (demoSession === "1") {
    if (isPublic) return NextResponse.redirect(new URL("/dashboard", request.url));
    return supabaseResponse;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isPublic && pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user && isPublic) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // If auth check fails, allow through rather than redirect loop
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
