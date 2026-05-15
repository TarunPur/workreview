'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'
import ImportTeamModal from '@/components/ImportTeamModal'

type Step = 'search' | 'review'

const RELATIONSHIP_OPTIONS = [
  { value: 'manager', label: 'They were my manager' },
  { value: 'peer', label: 'We were peers' },
  { value: 'direct_report', label: 'They were my direct report' },
  { value: 'colleague', label: 'We were colleagues' },
]

export default function WriteReviewForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [showAddNew, setShowAddNew] = useState(false)
  const [searching, setSearching] = useState(false)

  // New profile fields
  const [newName, setNewName] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newLinkedin, setNewLinkedin] = useState('')

  // Review fields
  const [relationship, setRelationship] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)

  const searchProfiles = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setShowAddNew(false); return }
    setSearching(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    setResults(data)
    setShowAddNew(true)
    setSearching(false)
  }, [])

  function handleSelectProfile(profile: Profile) {
    setSelectedProfile(profile)
    setStep('review')
  }

  async function handleAddNew() {
    if (!newName.trim() || !newCompany.trim()) return
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: newName.trim(),
        current_company: newCompany.trim(),
        current_title: newTitle.trim() || null,
        linkedin_url: newLinkedin.trim() || null,
      }),
    })
    if (res.ok || res.status === 200) {
      const profile = await res.json()
      setSelectedProfile(profile)
      setStep('review')
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProfile || !relationship || !content.trim()) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile_id: selectedProfile.id,
        relationship_type: relationship,
        content,
        is_anonymous: isAnonymous,
      }),
    })
    if (res.ok) {
      router.push(`/profile/${selectedProfile.slug}`)
    } else {
      const { error: msg } = await res.json()
      setError(msg === 'Unauthorized' ? 'You need to sign in to write a review.' : msg)
      setSubmitting(false)
    }
  }

  if (step === 'search') {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Who would you like to review?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchProfiles(query)}
              placeholder="Search by name or company..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => searchProfiles(query)}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {searching ? '...' : 'Search'}
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Select a person:</p>
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectProfile(p)}
                className="w-full text-left border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-900 text-sm">{p.full_name}</p>
                <p className="text-xs text-gray-500">
                  {p.current_title ? `${p.current_title} · ` : ''}{p.current_company}
                </p>
              </button>
            ))}
          </div>
        )}

        {showAddNew && results.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">No results found.</p>
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Can&apos;t find who you&apos;re looking for?</p>
              <p className="text-xs text-blue-700 mb-3">Import your team and we&apos;ll create their profiles instantly and notify them.</p>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Import your team
              </button>
            </div>
          </div>
        )}

        {showImportModal && (
          <ImportTeamModal
            onClose={() => setShowImportModal(false)}
            onImported={() => {
              setShowImportModal(false)
              setQuery('')
              setResults([])
              setShowAddNew(false)
            }}
          />
        )}

        {showAddNew && results.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-xl p-5 space-y-3">
            <p className="text-sm font-medium text-gray-700">Add a new person</p>
            <input
              type="text"
              placeholder="Full name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Company *"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Job title (optional)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              placeholder="LinkedIn URL (optional)"
              value={newLinkedin}
              onChange={(e) => setNewLinkedin(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddNew}
              disabled={!newName.trim() || !newCompany.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Add & Continue
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmitReview} className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-900">{selectedProfile?.full_name}</p>
          <p className="text-xs text-blue-600">{selectedProfile?.current_company}</p>
        </div>
        <button
          type="button"
          onClick={() => { setStep('search'); setSelectedProfile(null) }}
          className="text-xs text-blue-500 hover:underline"
        >
          Change
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What was your relationship?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRelationship(opt.value)}
              className={`border rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                relationship === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Your review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your honest experience working with this person..."
          rows={5}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="anon"
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300 text-blue-600"
        />
        <label htmlFor="anon" className="text-sm text-gray-700">
          Post anonymously
        </label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !relationship || !content.trim()}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
