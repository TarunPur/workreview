import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockUser = { id: 'user-123' }

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn()
const mockLike = vi.fn()

const mockFrom = vi.fn(() => ({
  select: mockSelect.mockReturnThis(),
  insert: mockInsert.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  like: mockLike.mockReturnThis(),
  single: mockSingle,
}))

const mockGetUser = vi.fn()

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('@/lib/slug', () => ({
  generateSlug: vi.fn((name: string, company: string) =>
    `${name}-${company}`.toLowerCase().replace(/\s+/g, '-')
  ),
}))

global.fetch = vi.fn().mockResolvedValue({ ok: true })

async function importRoute(body: unknown) {
  const { POST } = await import('@/app/api/profiles/import/route')
  const req = new NextRequest('http://localhost/api/profiles/import', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  return POST(req)
}

describe('POST /api/profiles/import', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await importRoute({ entries: [] })
    expect(res.status).toBe(401)
  })

  it('returns 400 when entries array is empty', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    const res = await importRoute({ entries: [] })
    expect(res.status).toBe(400)
  })

  it('returns 400 when entries is not an array', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })
    const res = await importRoute({ entries: null })
    expect(res.status).toBe(400)
  })

  it('skips entries missing required fields', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })

    const res = await importRoute({
      entries: [{ full_name: '', email: 'test@example.com', current_company: 'Acme' }],
    })
    const json = await res.json()
    expect(json.results).toHaveLength(0)
  })

  it('skips duplicate profiles by email', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    const existingProfile = {
      id: 'profile-existing',
      full_name: 'Jane Doe',
      email: 'jane@acme.com',
      current_company: 'Acme',
      slug: 'jane-doe-acme',
      is_claimed: false,
      claim_token: 'token-abc',
    }

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: existingProfile, error: null }),
    })

    const res = await importRoute({
      entries: [{ full_name: 'Jane Doe', email: 'jane@acme.com', current_company: 'Acme' }],
    })
    const json = await res.json()
    expect(json.results[0].created).toBe(false)
    expect(json.results[0].profile.id).toBe('profile-existing')
  })

  it('creates new profile and returns created: true', async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } })

    const newProfile = {
      id: 'profile-new',
      full_name: 'John Smith',
      email: 'john@acme.com',
      current_company: 'Acme',
      slug: 'john-smith-acme',
      is_claimed: false,
      claim_token: 'token-xyz',
    }

    // The route calls from() 3 times: email check, slug check, insert
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }),
      })
      .mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        like: vi.fn().mockResolvedValue({ data: [], error: null }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: newProfile, error: null }),
      })

    const res = await importRoute({
      entries: [{ full_name: 'John Smith', email: 'john@acme.com', current_company: 'Acme' }],
    })
    const json = await res.json()
    expect(res.status).toBe(201)
    expect(json.results[0].created).toBe(true)
    expect(json.results[0].profile.id).toBe('profile-new')
  })
})
