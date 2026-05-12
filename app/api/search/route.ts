import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json([])

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, current_company, current_title, slug')
    .textSearch('', q, {
      type: 'websearch',
      config: 'english',
    })
    .limit(10)

  if (error) {
    // Fallback to ilike if full-text search fails
    const { data: fallback } = await supabase
      .from('profiles')
      .select('id, full_name, current_company, current_title, slug')
      .or(`full_name.ilike.%${q}%,current_company.ilike.%${q}%`)
      .limit(10)
    return NextResponse.json(fallback ?? [])
  }

  return NextResponse.json(data ?? [])
}
