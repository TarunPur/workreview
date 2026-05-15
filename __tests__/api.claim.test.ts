import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

const unclaimedProfile = {
  id: 'profile-1',
  full_name: 'Jane Doe',
  current_company: 'Acme',
  current_title: 'Engineer',
  slug: 'jane-doe-acme',
  is_claimed: false,
  claim_token: 'valid-token',
}

function makeChain(result: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  }
}

async function getClaimRoute(token: string) {
  const { GET } = await import('@/app/api/claim/[token]/route')
  const req = new NextRequest(`http://localhost/api/claim/${token}`)
  return GET(req, { params: Promise.resolve({ token }) })
}

async function postClaimRoute(token: string) {
  const { POST } = await import('@/app/api/claim/[token]/route')
  const req = new NextRequest(`http://localhost/api/claim/${token}`, { method: 'POST' })
  return POST(req, { params: Promise.resolve({ token }) })
}

describe('GET /api/claim/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 404 for invalid token', async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: { message: 'not found' } }))
    const res = await getClaimRoute('bad-token')
    expect(res.status).toBe(404)
  })

  it('returns 409 if profile already claimed', async () => {
    mockFrom.mockReturnValue(makeChain({ data: { ...unclaimedProfile, is_claimed: true }, error: null }))
    const res = await getClaimRoute('valid-token')
    expect(res.status).toBe(409)
  })

  it('returns profile data for valid unclaimed token', async () => {
    mockFrom.mockReturnValue(makeChain({ data: unclaimedProfile, error: null }))
    const res = await getClaimRoute('valid-token')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.full_name).toBe('Jane Doe')
    expect(json.is_claimed).toBe(false)
  })
})

describe('POST /api/claim/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockFrom.mockReturnValue(makeChain({ data: unclaimedProfile, error: null }))
    const res = await postClaimRoute('valid-token')
    expect(res.status).toBe(401)
  })

  it('returns 404 for invalid token', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(makeChain({ data: null, error: { message: 'not found' } }))
    const res = await postClaimRoute('bad-token')
    expect(res.status).toBe(404)
  })

  it('returns 409 if profile already claimed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue(makeChain({ data: { ...unclaimedProfile, is_claimed: true }, error: null }))
    const res = await postClaimRoute('valid-token')
    expect(res.status).toBe(409)
  })

  it('claims profile successfully and returns slug', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn()
        .mockResolvedValueOnce({ data: unclaimedProfile, error: null })  // fetch profile
        .mockResolvedValueOnce({ data: null, error: null }),              // update
    })

    const res = await postClaimRoute('valid-token')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.slug).toBe('jane-doe-acme')
  })
})
