'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthState = { error: string } | null
type ForgotState = { error: string } | { sent: true } | null
type ResendState = { error: string } | { sent: true } | null

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  // se confirmação por email está ativa no Supabase, redireciona para OTP
  if (data.user && !data.user.email_confirmed_at) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function forgotPassword(prevState: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = formData.get('email') as string
  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Usa /api/auth/callback como intermediário para trocar o code por sessão (PKCE)
  // ou para preservar o hash no redirect (fluxo implícito)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/api/auth/callback?next=/reset-password`,
  })

  if (error) return { error: error.message }
  return { sent: true }
}

export async function resetPassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const code = formData.get('code') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) return { error: 'Link inválido ou expirado. Solicite um novo.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/login?reset=true')
}

export async function verifyEmail(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' })
  if (error) return { error: 'Código inválido ou expirado. Tente novamente.' }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function resendVerification(prevState: ResendState, formData: FormData): Promise<ResendState> {
  const email = formData.get('email') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: error.message }
  return { sent: true }
}
