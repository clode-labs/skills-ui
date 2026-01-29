import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, GitFork, Scale } from 'lucide-react'

import type { Skill } from '../types'

interface SkillListCardProps {
  skill: Skill
}

function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  }
  return count.toString()
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}

export const SkillListCard = memo(function SkillListCard({
  skill,
}: SkillListCardProps) {
  const linkPath = skill.full_id
    ? `/skills/${skill.full_id}`
    : `/skills/${skill.owner_id}/${skill.slug}`

  const authorName = skill.author_name || skill.repo_owner
  const category = skill.category || skill.tags?.[0]

  return (
    <Link
      to={linkPath}
      className="block py-5 px-4 my-1 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors"
    >
      <div className="flex items-start justify-between gap-6">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[20px] font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {skill.name}
            </h3>
            {category && (
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 text-[13px] font-medium rounded">
                {category}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[16px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            {skill.description || 'No description available'}
          </p>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skill.tags.slice(0, 5).map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[13px] rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[14px] text-slate-500 dark:text-slate-500">
            {/* Author */}
            <div className="flex items-center gap-2">
              {skill.author_avatar_url ? (
                <img
                  src={skill.author_avatar_url}
                  alt={authorName}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600" />
              )}
              <span className="font-medium">{authorName}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-600">•</span>

            {/* Updated time */}
            <span>{timeAgo(skill.updated_at)}</span>

            {skill.repo_license && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1">
                  <Scale size={14} />
                  {skill.repo_license}
                </span>
              </>
            )}

            {category && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span>{category}</span>
              </>
            )}
          </div>
        </div>

        {/* Right stats */}
        <div className="flex items-center gap-5 shrink-0 pt-1">
          {skill.repo_stars !== undefined && skill.repo_stars > 0 && (
            <div className="flex items-center gap-1.5 text-[15px] text-slate-600 dark:text-slate-400">
              <Star size={18} className="text-amber-500" fill="currentColor" />
              <span>{formatCount(skill.repo_stars)}</span>
            </div>
          )}
          {skill.repo_forks !== undefined && skill.repo_forks > 0 && (
            <div className="flex items-center gap-1.5 text-[15px] text-slate-600 dark:text-slate-400">
              <GitFork size={18} />
              <span>{formatCount(skill.repo_forks)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

export default SkillListCard
