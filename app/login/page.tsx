import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: 'Google sign-in is not configured yet.',
  session_not_configured: 'Player session secret is not configured.',
  invalid_state: 'Sign-in expired. Try again.',
  email_not_allowed: 'That account cannot sign in here.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>
}) {
  const params = await searchParams
  const errorKey = params.error?.trim()
  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] ?? 'Sign-in failed.' : null
  const returnTo = params.returnTo?.trim() || '/'
  const loginHref = `/api/player/google/login?returnTo=${encodeURIComponent(returnTo)}`

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">BDL Player</h1>
      <p className="text-sm text-zinc-600">Sign in with Google to manage your profile and registrations.</p>
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <Link
        href={loginHref}
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Sign in with Google
      </Link>
    </main>
  )
}
