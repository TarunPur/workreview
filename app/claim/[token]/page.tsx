import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ClaimButton from './ClaimButton'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ClaimPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, current_company, current_title, slug, is_claimed')
    .eq('claim_token', token)
    .single()

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full text-center">
          <Link href="/" className="block text-lg font-bold text-blue-700 mb-6">WorkReview</Link>
          <p className="text-gray-700 font-medium">This claim link is invalid or has expired.</p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Go home</Link>
        </div>
      </main>
    )
  }

  if (profile.is_claimed) {
    redirect(`/profile/${profile.slug}`)
  }

  if (!user) {
    redirect(`/auth/login?redirect=/claim/${token}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full">
        <Link href="/" className="block text-lg font-bold text-blue-700 mb-6">WorkReview</Link>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Claim your profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          Someone created a profile for you on WorkReview. Claim it to manage your presence and see your reviews.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6">
          <p className="font-semibold text-gray-900 text-sm">{profile.full_name}</p>
          <p className="text-xs text-gray-500">
            {profile.current_title ? `${profile.current_title} · ` : ''}{profile.current_company}
          </p>
        </div>

        <ClaimButton token={token} slug={profile.slug} />
      </div>
    </main>
  )
}
