export interface Profile {
  id: string
  full_name: string
  current_company: string
  current_title: string | null
  linkedin_url: string | null
  slug: string
  created_at: string
}

export interface Review {
  id: string
  profile_id: string
  reviewer_id: string
  relationship_type: 'manager' | 'peer' | 'direct_report' | 'colleague'
  content: string
  is_anonymous: boolean
  is_flagged: boolean
  created_at: string
  reviewer?: { full_name: string }
}

export interface Flag {
  id: string
  review_id: string
  reporter_id: string
  reason: string
  created_at: string
}
