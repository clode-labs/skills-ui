import { Link } from 'react-router-dom';
import { Star, Download, Tag } from 'lucide-react';
import type { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard = ({ skill }: SkillCardProps) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      featured: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-blue-100 text-blue-800 border-blue-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      archived: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <Link
      to={`/skills/${skill.full_id}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-300 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">
              {skill.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {skill.name}
            </h3>
            <p className="text-sm text-gray-500">
              {skill.slug}
            </p>
          </div>
        </div>
        {skill.status === 'featured' && (
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(skill.status)}`}>
            Featured
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {skill.description}
      </p>

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              <Tag size={12} />
              {tag}
            </span>
          ))}
          {skill.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{skill.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Category */}
      {skill.category_name && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full">
            {skill.category_name}
          </span>
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500" />
          <span>{skill.star_count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Download size={16} className="text-gray-400" />
          <span>{skill.download_count}</span>
        </div>
        {skill.license && (
          <div className="ml-auto text-xs">
            {skill.license}
          </div>
        )}
      </div>
    </Link>
  );
};

export default SkillCard;
