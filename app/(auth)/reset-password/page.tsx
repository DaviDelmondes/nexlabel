import { redirect } from 'next/navigation'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  if (!code) redirect('/forgot-password')
  return <ResetPasswordForm code={code} />
}
