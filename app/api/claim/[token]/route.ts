import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, current_company, current_title, slug, is_claimed, claim_token')
    .eq('claim_token', token)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Invalid or expired claim link' }, { status: 404 })
  }

  if (profile.is_claimed) {
    return NextResponse.json({ error: 'Profile already claimed' }, { status: 409 })
  }

  return NextResponse.json(profile)
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, slug, is_claimed')
    .eq('claim_token', token)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Invalid or expired claim link' }, { status: 404 })
  }

  if (profile.is_claimed) {
    return NextResponse.json({ error: 'Profile already claimed' }, { status: 409 })
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_claimed: true })
    .eq('id', profile.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ slug: profile.slug })
}
