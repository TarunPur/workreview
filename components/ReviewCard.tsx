'use client'

import { useState } from 'react'
import { Review } from '@/lib/types'
import FlagButton from './FlagButton'

const RELATIONSHIP_LABELS: Record<string, string> = {
  manager: 'Manager',
  peer: 'Peer',
  direct_report: 'Direct Report',
  colleague: 'Colleague',
}

export default function ReviewCard({ review }: { review: Review }) {
  const [flagged, setFlagged] = useState(false)

  const authorName = review.is_anonymous
    ? 'Anonymous Professional'
    : review.reviewer?.full_name ?? 'Unknown'

  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">{authorName}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {RELATIONSHIP_LABELS[review.relationship_type]}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {review.content}
          </p>
        </div>
        {!flagged && (
          <FlagButton reviewId={review.id} onFlagged={() => setFlagged(true)} />
        )}
      </div>
      {flagged && (
        <p className="mt-3 text-xs text-gray-400 italic">Review flagged for moderation.</p>
      )}
    </div>
  )
}
