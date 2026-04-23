import ResetPasswordForm from './ResetPasswordForm'

export default function ResetPasswordPage() {
  // Sessão já foi estabelecida pelo /api/auth/callback (PKCE)
  // ou o hash #access_token= está na URL (fluxo implícito)
  // O ResetPasswordForm cuida de ambos os casos no client
  return <ResetPasswordForm />
}
