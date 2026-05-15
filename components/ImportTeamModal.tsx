'use client'

import { useState } from 'react'

interface TeamMember {
  full_name: string
  email: string
  current_company: string
  current_title: string
}

function emptyMember(): TeamMember {
  return { full_name: '', email: '', current_company: '', current_title: '' }
}

interface ImportTeamModalProps {
  onClose: () => void
  onImported: () => void
}

export default function ImportTeamModal({ onClose, onImported }: ImportTeamModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([emptyMember()])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function updateMember(index: number, field: keyof TeamMember, value: string) {
    setMembers((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addRow() {
    setMembers((prev) => [...prev, emptyMember()])
  }

  function removeRow(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    const valid = members.filter(
      (m) => m.full_name.trim() && m.email.trim() && m.current_company.trim()
    )
    if (valid.length === 0) {
      setError('Please fill in at least one person with name, email, and company.')
      return
    }

    setSubmitting(true)
    setError('')

    const res = await fetch('/api/profiles/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: valid }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Import your team</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {done ? (
          <div className="p-6 text-center space-y-4">
            <div className="text-3xl">✓</div>
            <p className="text-gray-900 font-medium">Profiles created!</p>
            <p className="text-sm text-gray-500">
              Your teammates have been sent an email to claim their profiles. You can now search for them and write a review.
            </p>
            <button
              onClick={onImported}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Search for them now
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            <div className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div>
                <p className="text-sm font-medium text-gray-700">Connect Google Contacts</p>
                <p className="text-xs text-gray-400">Auto-import your work contacts</p>
              </div>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Coming soon</span>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-gray-400">or add manually</span>
              </div>
            </div>

            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 space-y-2 relative">
                  {members.length > 1 && (
                    <button
                      onClick={() => removeRow(index)}
                      className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg leading-none"
                    >
                      &times;
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full name *"
                      value={member.full_name}
                      onChange={(e) => updateMember(index, 'full_name', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Work email *"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Company *"
                      value={member.current_company}
                      onChange={(e) => updateMember(index, 'current_company', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Job title (optional)"
                      value={member.current_title}
                      onChange={(e) => updateMember(index, 'current_title', e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addRow}
              className="text-sm text-blue-600 hover:underline"
            >
              + Add another person
            </button>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Importing...' : 'Import & send invites'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
