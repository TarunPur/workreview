import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProfileHeader from '@/components/ProfileHeader'
import ReviewCard from '@/components/ReviewCard'
import { Review } from '@/lib/types'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!profile) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:users(full_name)')
    .eq('profile_id', profile.id)
    .eq('is_flagged', false)
    .order('created_at', { ascending: false })

  const reviewList: Review[] = (reviews ?? []).map((r) => ({
    ...r,
    reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer,
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700">WorkReview</Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link
            href={`/write-review?profile=${profile.slug}`}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Write a review
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        <ProfileHeader profile={profile} />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {reviewList.length} Review{reviewList.length !== 1 ? 's' : ''}
          </h2>
          <Link
            href={`/write-review?profile=${profile.slug}`}
            className="text-sm text-blue-600 hover:underline"
          >
            + Write a review
          </Link>
        </div>

        {reviewList.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No reviews yet.</p>
            <Link
              href={`/write-review?profile=${profile.slug}`}
              className="mt-3 inline-block text-sm text-blue-600 hover:underline"
            >
              Be the first to write one →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewList.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
