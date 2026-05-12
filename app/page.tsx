import SearchBar from '@/components/SearchBar'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700">WorkReview</Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center px-6 py-24">
        <h1 className="text-4xl font-bold text-gray-900 max-w-2xl leading-tight">
          Honest reviews about the people you&apos;ve worked with
        </h1>
        <p className="mt-4 text-gray-500 text-lg max-w-xl">
          Search for a manager or colleague to read their reviews, or share your own experience to help others make informed career decisions.
        </p>
        <div className="mt-8 w-full flex justify-center">
          <SearchBar />
        </div>
        <Link
          href="/write-review"
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Write a review →
        </Link>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { title: 'Anonymous or named', desc: 'Your choice. Post with your identity or stay anonymous — every review is respected either way.' },
          { title: 'Real professionals', desc: 'Reviews are written by people who actually worked with the person being reviewed.' },
          { title: 'Flag abuse', desc: 'Community moderation keeps the platform honest. Flag reviews that seem fake or unfair.' },
        ].map((f) => (
          <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
            <p className="text-gray-500 text-sm mt-1">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
