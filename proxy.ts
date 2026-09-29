import {
  createServerClient,
  parseCookieHeader,
} from "@supabase/ssr"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const PROTECTED_PREFIX = "/app"
const AUTH_PREFIX = "/auth"

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString())
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  let session: { user: { id: string } } | null = null
  try {
    const { data } = await supabase.auth.getUser()
    session = data.user ? { user: { id: data.user.id } } : null
  } catch {
    session = null
  }

  const path = request.nextUrl.pathname
  // DOKU webhook harus publik tanpa cek auth (verify signature di route)
  if (path.startsWith("/api/doku/")) return response

  const isProtected =
    path === PROTECTED_PREFIX || path.startsWith(`${PROTECTED_PREFIX}/`)
  const isAuthPage =
    path === AUTH_PREFIX || path.startsWith(`${AUTH_PREFIX}/`)

  if (isProtected && !session) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone()
    url.pathname = "/app"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp3|woff2?)$).*)",
  ],
}
