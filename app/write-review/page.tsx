import Link from 'next/link'
import WriteReviewForm from '@/components/WriteReviewForm'

export default function WriteReviewPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700">WorkReview</Link>
        <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Write a review</h1>
        <p className="text-sm text-gray-500 mb-8">
          Search for the person you&apos;d like to review. Your honest feedback helps others make better career decisions.
        </p>
        <WriteReviewForm />
      </div>
    </main>
  )
}
