import { Link } from 'react-router-dom';
import { Star, GitFork } from 'lucide-react';
import type { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
}

function formatDownloads(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const linkPath = skill.full_id
    ? `/skills/${skill.full_id}`
    : `/skills/${skill.owner_id}/${skill.slug}`;

  const publishDate = skill.published_at || skill.updated_at || skill.created_at;
  const authorName = skill.author_name || skill.repo_owner;

  return (
    <Link
      to={linkPath}
      className="block border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Package name */}
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-lg text-blue-600 hover:underline">
              {skill.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mt-1 line-clamp-2">
            {skill.description}
          </p>

          {/* Tags/Keywords */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {skill.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                >
                  {tag}
                </span>
              ))}
              {skill.tags.length > 5 && (
                <span className="text-gray-400 text-xs">
                  +{skill.tags.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {authorName && (
              <span className="hover:text-gray-700">
                {authorName}
              </span>
            )}
            <span>published {formatDate(publishDate)}</span>
            {(skill.repo_stars !== undefined && skill.repo_stars > 0) && (
              <span className="flex items-center gap-1">
                <Star size={12} />
                {formatDownloads(skill.repo_stars)}
              </span>
            )}
            {(skill.repo_forks !== undefined && skill.repo_forks > 0) && (
              <span className="flex items-center gap-1">
                <GitFork size={12} />
                {formatDownloads(skill.repo_forks)}
              </span>
            )}
          </div>
        </div>

        {/* Right side - Stats */}
        <div className="text-right shrink-0 text-xs text-gray-500">
          <div className="font-medium text-gray-700">
            {formatDownloads(skill.download_count || 0)}
          </div>
          <div className="text-gray-400">downloads</div>
        </div>
      </div>
    </Link>
  );
}
