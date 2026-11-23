// EL FASL — sign out route: clears the Supabase session + the demo cookie.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE } from "@/lib/demo";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
