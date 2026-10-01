import { ProfileForm } from '@/app/components/ProfileForm'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-semibold">Your profile</h1>
      <ProfileForm />
    </main>
  )
}
