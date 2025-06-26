import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // 💡 LA CORREZIONE È QUI:
    // Risolviamo la promise `cookies()` PRIMA di usarla.
    const cookieStore = await cookies() 

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Ora 'cookieStore' è l'oggetto corretto, non una promise
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Reindirizzamento in caso di successo
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Reindirizzamento in caso di errore o codice mancante
  console.error("Authentication error: Could not exchange code for session or code is missing.");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}