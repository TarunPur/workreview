import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json([])

  const supabase = await createServerSupabaseClient()

  // Split into words and AND them together so "Harsh Julka" only matches
  // profiles containing both words, not every profile in the table
  const words = q.split(/\s+/).filter(Boolean)

  let query = supabase
    .from('profiles')
    .select('id, full_name, current_company, current_title, slug')
    .limit(10)

  for (const word of words) {
    query = query.or(`full_name.ilike.%${word}%,current_company.ilike.%${word}%`)
  }

  const { data } = await query

  return NextResponse.json(data ?? [])
}
