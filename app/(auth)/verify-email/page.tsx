import { redirect } from 'next/navigation'
import VerifyEmailForm from './VerifyEmailForm'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email } = await searchParams
  if (!email) redirect('/signup')
  return <VerifyEmailForm email={email} />
}
