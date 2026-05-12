import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'
import SearchBar from '@/components/SearchBar'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  let results: { id: string; full_name: string; current_company: string; current_title: string | null; slug: string }[] = []

  if (query) {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, current_company, current_title, slug')
      .or(`full_name.ilike.%${query}%,current_company.ilike.%${query}%`)
      .limit(20)
    results = data ?? []
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-blue-700">WorkReview</Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900">Sign in</Link>
          <Link href="/write-review" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Write a review
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-6">
          <SearchBar defaultValue={query} />
        </div>

        {query && (
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.slug}`}
                className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-gray-900">{p.full_name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {p.current_title ? `${p.current_title} · ` : ''}{p.current_company}
                </p>
              </Link>
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg">No results found for &ldquo;{query}&rdquo;</p>
            <Link
              href="/write-review"
              className="mt-4 inline-block text-sm text-blue-600 hover:underline"
            >
              Add this person and write a review →
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  )
}
