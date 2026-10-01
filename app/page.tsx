'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Me = {
  email: string
  firstName: string | null
  lastName: string | null
  selfReportedSkill: string | null
}

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) throw new Error('Not signed in')
        setMe((await res.json()) as Me)
      } catch {
        setError('Sign in to view your profile.')
      }
    })()
  }, [])

  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <p className="mt-2 text-sm">
        <Link href="/leagues" className="underline">
          Browse leagues
        </Link>
      </p>
      {error ? (
        <p className="mt-4 text-sm text-zinc-600">
          {error}{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      ) : null}
      {me ? (
        <dl className="mt-6 space-y-2 text-sm">
          <div>
            <dt className="font-medium">Email</dt>
            <dd>{me.email}</dd>
          </div>
          <div>
            <dt className="font-medium">Self-reported skill</dt>
            <dd>{me.selfReportedSkill ?? 'Not set'}</dd>
          </div>
        </dl>
      ) : null}
    </main>
  )
}
