import { Shield, Award, Clock, ThumbsUp, Star, Users } from 'lucide-react'

const badges = [
  {
    icon: Shield,
    title: 'Licensed & Insured',
    description: 'Fully licensed and insured for your protection',
  },
  {
    icon: Award,
    title: 'Master Electrician',
    description: 'Highest level of expertise and training',
  },
  {
    icon: Clock,
    title: 'On-Time Guarantee',
    description: 'We respect your time and show up as scheduled',
  },
  {
    icon: ThumbsUp,
    title: '100% Satisfaction',
    description: 'Your satisfaction is our top priority',
  },
  {
    icon: Star,
    title: '5-Star Rated',
    description: 'Consistently rated 5 stars by our customers',
  },
  {
    icon: Users,
    title: 'Family Owned',
    description: 'Serving our community with care',
  },
]

export function TrustBadges() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {badges.map((badge) => (
        <div
          key={badge.title}
          className="flex flex-col items-center text-center p-4"
        >
          <div className="w-14 h-14 bg-accent-soft rounded-xl flex items-center justify-center mb-3">
            <badge.icon className="h-7 w-7 text-accent" />
          </div>
          <h3 className="font-semibold text-primary text-sm mb-1">{badge.title}</h3>
          <p className="text-muted text-xs">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}
