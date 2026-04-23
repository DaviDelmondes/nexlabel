import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  // Não redireciona quando não há ?code — o client component
  // trata o caso do token vir como #access_token= no hash da URL
  return <ResetPasswordForm code={code} />
}
