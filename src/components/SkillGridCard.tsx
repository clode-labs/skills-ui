import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star, GitFork, Lock, ArrowUpRight } from 'lucide-react'

import type { Skill } from '../types'

interface SkillGridCardProps {
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

// Generate a consistent color based on category name
function getCategoryColor(category?: string): string {
  const colors = [
    'from-violet-500/20 to-purple-500/20 border-violet-500/30',
    'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    'from-orange-500/20 to-amber-500/20 border-orange-500/30',
    'from-pink-500/20 to-rose-500/20 border-pink-500/30',
    'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
  ]
  if (!category) return colors[0]
  const index = category
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export const SkillGridCard = memo(function SkillGridCard({
  skill,
}: SkillGridCardProps) {
  const linkPath = skill.full_id
    ? `/skills/${skill.full_id}`
    : `/skills/${skill.owner_id}/${skill.slug}`

  const authorName = skill.author_name || skill.repo_owner
  const category = skill.category || skill.tags?.[0]
  const colorClass = getCategoryColor(category)

  return (
    <Link
      to={linkPath}
      className={`group relative flex flex-col h-full bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-violet-300 dark:hover:border-violet-500/50`}
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass}`} />

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Header: Title + Arrow */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 flex-1">
            {skill.name}
          </h3>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-slate-400 dark:text-slate-600 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0"
          />
        </div>

        {/* Category/Tag badge */}
        {category && (
          <div className="mb-2">
            <span className="inline-flex px-2 py-0.5 bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-400 text-[11px] font-medium rounded-md">
              {category}
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-1 mb-3">
          {skill.description || 'No description available'}
        </p>

        {/* Private badge if applicable */}
        {skill.is_private && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded-md">
              <Lock size={10} />
              Private
            </span>
          </div>
        )}

        {/* Footer: Author + Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
          <div className="flex items-center gap-2 min-w-0">
            {skill.author_avatar_url ? (
              <img
                src={skill.author_avatar_url}
                alt={authorName}
                className="w-5 h-5 rounded-full shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600 shrink-0" />
            )}
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-500 truncate">
              {authorName}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {skill.repo_stars !== undefined && skill.repo_stars > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                <Star
                  size={12}
                  className="text-amber-500"
                  fill="currentColor"
                />
                {formatCount(skill.repo_stars)}
              </span>
            )}
            {skill.repo_forks !== undefined && skill.repo_forks > 0 && (
              <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                <GitFork size={12} />
                {formatCount(skill.repo_forks)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
})

export default SkillGridCard
