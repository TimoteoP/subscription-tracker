import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // La nuova sintassi usa una singola funzione per leggere tutti i cookie
        getAll() {
          return request.cookies.getAll()
        },
        // E una singola funzione per impostare e rimuovere i cookie
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Rinfresca la sessione se scade.
  // Importante: questo popola anche `response.cookies` se la sessione viene rinfrescata.
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon.ico (icona)
     * - /auth (percorsi di autenticazione come login/callback)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth).*)',
  ],
}