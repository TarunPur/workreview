'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function FlagButton({
  reviewId,
  onFlagged,
}: {
  reviewId: string
  onFlagged: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleFlag() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Sign in to flag reviews')
      return
    }

    setLoading(true)
    const res = await fetch('/api/flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review_id: reviewId, reason: 'inappropriate' }),
    })

    if (res.ok) {
      onFlagged()
    } else {
      const { error: msg } = await res.json()
      setError(msg === 'Already flagged' ? 'Already flagged' : 'Could not flag')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleFlag}
        disabled={loading}
        title="Flag this review"
        className="text-gray-300 hover:text-red-400 transition-colors text-xs"
      >
        ⚑
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
