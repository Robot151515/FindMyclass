import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  // DUMMY AUTH INTERCEPTOR
  const dummyAuth = cookieStore.get('dummy-auth')?.value
  if (dummyAuth) {
    return {
      auth: {
        getUser: async () => ({ 
          data: { 
            user: { 
              id: '123e4567-e89b-12d3-a456-426614174000', 
              email: dummyAuth, 
              user_metadata: { full_name: dummyAuth.split('@')[0] } 
            } 
          } 
        }),
        signOut: async () => {},
      }
    } as any
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
