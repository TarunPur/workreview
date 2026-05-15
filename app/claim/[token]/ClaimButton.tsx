'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClaimButton({ token, slug }: { token: string; slug: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClaim() {
    setLoading(true)
    setError('')

    const res = await fetch(`/api/claim/${token}`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.push(`/profile/${slug}`)
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        onClick={handleClaim}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Claiming...' : 'Claim this profile'}
      </button>
    </div>
  )
}
