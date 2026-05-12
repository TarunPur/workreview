import { Profile } from '@/lib/types'

export default function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold shrink-0">
          {profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            {profile.current_title ? `${profile.current_title} · ` : ''}
            {profile.current_company}
          </p>
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              LinkedIn Profile
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
