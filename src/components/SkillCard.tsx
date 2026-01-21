import { Link } from 'react-router-dom'
import { Star, GitFork, Download, ArrowUpRight, Lock } from 'lucide-react'

import type { Skill } from '../types'

interface SkillCardProps {
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

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''

  const date = new Date(dateString)

  // Check for invalid date or unreasonably old dates (before year 2000)
  if (isNaN(date.getTime()) || date.getFullYear() < 2000) return ''

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Handle future dates
  if (diffDays < 0) return 'Just now'

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

export default function SkillCard({ skill }: SkillCardProps) {
  const linkPath = skill.full_id
    ? `/skills/${skill.full_id}`
    : `/skills/${skill.owner_id}/${skill.slug}`

  const publishDate = skill.published_at || skill.updated_at || skill.created_at
  const authorName = skill.author_name || skill.repo_owner

  return (
    <Link
      to={linkPath}
      className="block px-5 py-5 border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-colors group"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors tracking-tight">
              {skill.name}
            </h3>
            {skill.is_private && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[10px] font-medium rounded">
                <Lock size={10} />
                Private
              </span>
            )}
            <ArrowUpRight
              size={14}
              className="text-slate-400 dark:text-slate-600 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
            />
          </div>

          {/* Description */}
          <p className="text-[13px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {skill.description}
          </p>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {skill.tags.slice(0, 4).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] rounded font-medium tracking-wide"
                >
                  {tag}
                </span>
              ))}
              {skill.tags.length > 4 && (
                <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                  +{skill.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 text-[12px] text-slate-500">
            {authorName && (
              <span className="font-medium text-slate-600 dark:text-slate-400">
                {authorName}
              </span>
            )}
            {formatDate(publishDate) && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                <span>{formatDate(publishDate)}</span>
              </>
            )}
            {skill.repo_stars !== undefined && skill.repo_stars > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Star
                    size={11}
                    className="text-amber-500 dark:text-amber-400"
                    fill="currentColor"
                  />
                  {formatCount(skill.repo_stars)}
                </span>
              </>
            )}
            {skill.repo_forks !== undefined && skill.repo_forks > 0 && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <GitFork size={11} />
                {formatCount(skill.repo_forks)}
              </span>
            )}
          </div>
        </div>

        {/* Download count */}
        <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Download size={13} />
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatCount(skill.download_count || 0)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
