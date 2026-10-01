'use client'

import { SELF_REPORTED_SKILL_VALUES } from '@bdl/player-public-contract'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Me = {
  email: string
  firstName: string | null
  lastName: string | null
  selfReportedSkill: string | null
}

const SKILL_LABELS: Record<(typeof SELF_REPORTED_SKILL_VALUES)[number], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  highly_advanced: 'Highly advanced',
}

export function ProfileForm() {
  const [me, setMe] = useState<Me | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [selfReportedSkill, setSelfReportedSkill] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/me')
        if (!res.ok) throw new Error('Not signed in')
        const body = (await res.json()) as Me
        setMe(body)
        setFirstName(body.firstName ?? '')
        setLastName(body.lastName ?? '')
        setSelfReportedSkill(body.selfReportedSkill ?? '')
      } catch {
        setLoadError('Sign in to view your profile.')
      }
    })()
  }, [])

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!me) return
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          selfReportedSkill: selfReportedSkill || null,
        }),
      })
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(err?.error ?? 'Save failed')
      }
      const body = (await res.json()) as Me
      setMe(body)
      setFirstName(body.firstName ?? '')
      setLastName(body.lastName ?? '')
      setSelfReportedSkill(body.selfReportedSkill ?? '')
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <p className="mt-2 text-sm">
        <Link href="/leagues" className="underline">
          Browse leagues
        </Link>
      </p>
      {loadError ? (
        <p className="mt-4 text-sm text-zinc-600">
          {loadError}{' '}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </p>
      ) : null}
      {me ? (
        <form className="mt-6 space-y-4 text-sm" onSubmit={onSubmit}>
          <div>
            <label className="block font-medium" htmlFor="profile-email">
              Email
            </label>
            <p id="profile-email" className="mt-1 text-zinc-600">
              {me.email}
            </p>
          </div>
          <div>
            <label className="block font-medium" htmlFor="profile-first-name">
              First name
            </label>
            <input
              id="profile-first-name"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div>
            <label className="block font-medium" htmlFor="profile-last-name">
              Last name
            </label>
            <input
              id="profile-last-name"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
          <div>
            <label className="block font-medium" htmlFor="profile-skill">
              Self-reported skill
            </label>
            <select
              id="profile-skill"
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
              value={selfReportedSkill}
              onChange={(e) => setSelfReportedSkill(e.target.value)}
            >
              <option value="">Not set</option>
              {SELF_REPORTED_SKILL_VALUES.map((value) => (
                <option key={value} value={value}>
                  {SKILL_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          {saveError ? <p className="text-red-600">{saveError}</p> : null}
          {saved ? <p className="text-green-700">Profile saved.</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </form>
      ) : null}
    </>
  )
}
