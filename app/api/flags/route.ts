import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { review_id, reason } = body

  if (!review_id) {
    return NextResponse.json({ error: 'review_id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('flags')
    .insert({ review_id, reporter_id: user.id, reason })

  if (error) {
    // Unique constraint violation = already flagged
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already flagged' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-hide review after 3 flags
  const { count } = await supabase
    .from('flags')
    .select('*', { count: 'exact', head: true })
    .eq('review_id', review_id)

  if (count && count >= 3) {
    await supabase
      .from('reviews')
      .update({ is_flagged: true })
      .eq('id', review_id)
  }

  return NextResponse.json({ success: true })
}
