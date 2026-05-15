import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/slug'
import { NextRequest, NextResponse } from 'next/server'

interface ImportEntry {
  full_name: string
  email: string
  current_company: string
  current_title?: string
}

async function sendClaimEmail(to: string, name: string, claimToken: string) {
  const claimUrl = `${process.env.NEXT_PUBLIC_APP_URL}/claim/${claimToken}`

  if (!process.env.RESEND_API_KEY) {
    console.log(`[claim email] To: ${to}, URL: ${claimUrl}`)
    return
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'WorkReview <onboarding@resend.dev>',
      to,
      subject: 'Someone left you a review on WorkReview',
      html: `
        <p>Hi ${name},</p>
        <p>Someone you've worked with left you a review on WorkReview.</p>
        <p>Claim your profile to see what they said and manage your presence:</p>
        <p><a href="${claimUrl}">Claim my profile</a></p>
        <p>— The WorkReview team</p>
      `,
    }),
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const entries: ImportEntry[] = body.entries

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: 'No entries provided' }, { status: 400 })
  }

  const results = []

  for (const entry of entries) {
    const { full_name, email, current_company, current_title } = entry

    if (!full_name?.trim() || !email?.trim() || !current_company?.trim()) continue

    // Check if profile with this email already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      results.push({ profile: existing, created: false })
      continue
    }

    const baseSlug = generateSlug(full_name.trim(), current_company.trim())
    let slug = baseSlug

    const { data: taken } = await supabase
      .from('profiles')
      .select('slug')
      .like('slug', `${baseSlug}%`)

    if (taken && taken.length > 0) {
      slug = `${baseSlug}-${taken.length + 1}`
    }

    const { data: created, error } = await supabase
      .from('profiles')
      .insert({
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        current_company: current_company.trim(),
        current_title: current_title?.trim() || null,
        slug,
        is_claimed: false,
        imported_by: user.id,
      })
      .select()
      .single()

    if (error || !created) continue

    results.push({ profile: created, created: true })

    await sendClaimEmail(created.email!, created.full_name, created.claim_token!)
  }

  return NextResponse.json({ results }, { status: 201 })
}
