import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateSlug } from '@/lib/slug'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { full_name, current_company, current_title, linkedin_url } = body

  if (!full_name || !current_company) {
    return NextResponse.json({ error: 'Name and company are required' }, { status: 400 })
  }

  const baseSlug = generateSlug(full_name, current_company)

  // Check for existing profile with same slug
  const { data: existing } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', baseSlug)
    .single()

  if (existing) return NextResponse.json(existing)

  // Try with suffix if slug taken by a different person
  let slug = baseSlug
  const { data: taken } = await supabase
    .from('profiles')
    .select('slug')
    .like('slug', `${baseSlug}%`)
  if (taken && taken.length > 0) {
    slug = `${baseSlug}-${taken.length + 1}`
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ full_name, current_company, current_title, linkedin_url, slug })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
