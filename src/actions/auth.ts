'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  
  // BYPASS AUTHENTICATION FOR DUMMY LOGIN
  const cookieStore = await cookies()
  cookieStore.set('dummy-auth', email, { path: '/' })

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('dummy-auth')
  
  revalidatePath('/', 'layout')
  redirect('/login')
}
