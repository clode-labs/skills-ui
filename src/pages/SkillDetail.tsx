import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Skill } from '../types';
import { ArrowLeft, Star, Download, ExternalLink, Tag, Calendar } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const SkillDetail = () => {
  const { owner, slug } = useParams<{ owner: string; slug: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (owner && slug) {
      loadSkill();
    }
  }, [owner, slug]);

  const loadSkill = async () => {
    try {
      setLoading(true);
      const response = await api.getSkill(owner!, slug!);
      setSkill(response.data);
    } catch (error) {
      console.error('Error loading skill:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Not Found</h2>
        <p className="text-gray-600 mb-6">The skill you're looking for doesn't exist.</p>
        <Link to="/" className="text-red-600 hover:text-red-700 font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Skills</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-3xl">
              {skill.name.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {skill.name}
                </h1>
                <p className="text-gray-600">
                  {skill.full_id}
                </p>
              </div>

              {/* Status Badge */}
              {skill.status === 'featured' && (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full border border-yellow-200">
                  Featured
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star size={18} className="text-yellow-500" />
                <span className="font-medium">{skill.star_count}</span>
                <span>stars</span>
              </div>
              <div className="flex items-center gap-2">
                <Download size={18} className="text-gray-400" />
                <span className="font-medium">{skill.download_count}</span>
                <span>downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>
                  Updated {new Date(skill.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-lg mt-6 leading-relaxed">
          {skill.description}
        </p>

        {/* Tags */}
        {skill.tags && skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
          {skill.source_url && (
            <a
              href={skill.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <ExternalLink size={18} />
              View Source
            </a>
          )}
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">
            Use This Skill
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-3">
            {skill.category_name && (
              <div>
                <dt className="text-sm text-gray-600">Category</dt>
                <dd className="text-gray-900 font-medium">{skill.category_name}</dd>
              </div>
            )}
            {skill.license && (
              <div>
                <dt className="text-sm text-gray-600">License</dt>
                <dd className="text-gray-900 font-medium">{skill.license}</dd>
              </div>
            )}
            {skill.compatibility && (
              <div>
                <dt className="text-sm text-gray-600">Compatibility</dt>
                <dd className="text-gray-900 font-medium">{skill.compatibility}</dd>
              </div>
            )}
            {skill.source_type && (
              <div>
                <dt className="text-sm text-gray-600">Source Type</dt>
                <dd className="text-gray-900 font-medium capitalize">{skill.source_type}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600">Full ID</dt>
              <dd className="text-gray-900 font-mono text-sm">{skill.full_id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Owner ID</dt>
              <dd className="text-gray-900 font-mono text-sm">{skill.owner_id}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Status</dt>
              <dd className="text-gray-900 font-medium capitalize">{skill.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Created</dt>
              <dd className="text-gray-900">{new Date(skill.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SkillDetail;
