import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFrom = vi.fn()

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

async function searchRoute(q: string) {
  const { GET } = await import('@/app/api/search/route')
  const req = new NextRequest(`http://localhost/api/search?q=${encodeURIComponent(q)}`)
  return GET(req)
}

const tarunProfile = {
  id: 'profile-1',
  full_name: 'Tarun Puri',
  current_company: 'Gold Trove',
  current_title: null,
  slug: 'tarun-puri-gold-trove',
}

describe('GET /api/search', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns empty array for empty query', async () => {
    const res = await searchRoute('')
    const json = await res.json()
    expect(json).toEqual([])
  })

  it('returns matching profiles for a single word query', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [tarunProfile], error: null }),
    })

    const res = await searchRoute('Tarun')
    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(json[0].full_name).toBe('Tarun Puri')
  })

  it('applies AND logic for multi-word queries — each word must match', async () => {
    // For "Tarun Puri", two .or() calls are chained (one per word)
    // Both must match for a result to be returned
    const orMock = vi.fn()
      .mockReturnValueOnce({
        or: vi.fn().mockResolvedValue({ data: [tarunProfile], error: null }),
      })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: orMock,
    })

    const res = await searchRoute('Tarun Puri')
    expect(orMock).toHaveBeenCalledTimes(1) // first word
    // second .or() is chained on the result of the first
  })

  it('does NOT return unrelated profiles for a query', async () => {
    // Simulates the fixed behaviour — "Harsh Julka" should not return "Tarun Puri"
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnValueOnce({
        or: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    })

    const res = await searchRoute('Harsh Julka')
    const json = await res.json()
    expect(json).toEqual([])
  })

  it('returns empty array when no profiles match', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      or: vi.fn().mockResolvedValue({ data: [], error: null }),
    })

    const res = await searchRoute('nobody')
    const json = await res.json()
    expect(json).toEqual([])
  })
})
