import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, GitFork, Copy, Check, Download } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { Skill } from '../types';
import SkillFilesExplorer from '../components/SkillFilesExplorer';

export default function SkillDetail() {
  const { owner, repo, name } = useParams<{ owner: string; repo: string; name: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activePackageManager, setActivePackageManager] = useState<'pnpm' | 'npm' | 'yarn' | 'bun'>('pnpm');

  useEffect(() => {
    const fetchSkill = async () => {
      if (!owner || !repo || !name) return;
      setLoading(true);
      try {
        const response = await api.getSkill(owner, repo, name);
        setSkill(response.data);
      } catch (error) {
        console.error('Failed to fetch skill:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [owner, repo, name]);

  const getInstallCommand = (pm: string) => {
    if (!skill) return '';
    const repoUrl = skill.repo_url || `https://github.com/${skill.repo_owner}/${skill.repo_name}`;
    return `${pm} dlx add-skill ${repoUrl}`;
  };

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(getInstallCommand(activePackageManager));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!skill) return;
    // Direct download - the backend returns the ZIP file directly
    const downloadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086'}/skills/${skill.full_id}/download`;
    window.location.href = downloadUrl;
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link to="/skills" className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black">
                Skills
              </Link>
              <Link to="/authors" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
                Authors
              </Link>
              <Link to="/categories" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
                Categories
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link to="/skills" className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black">
                Skills
              </Link>
              <Link to="/authors" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
                Authors
              </Link>
              <Link to="/categories" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
                Categories
              </Link>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Skill Not Found</h2>
          <p className="text-gray-600 mb-6">The skill you're looking for doesn't exist.</p>
          <Link to="/skills" className="text-blue-600 hover:underline font-medium">
            Back to Skills
          </Link>
        </div>
      </div>
    );
  }

  const repoUrl = skill.repo_url || `https://github.com/${skill.repo_owner}/${skill.repo_name}`;
  const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const;

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-6">
            <Link to="/skills" className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black">
              Skills
            </Link>
            <Link to="/authors" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
              Authors
            </Link>
            <Link to="/categories" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent">
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Left Column - Title & Install */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title Section */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex-shrink-0"
                >
                  <Download size={18} />
                  Download Skill
                </button>
              </div>
              <p className="text-gray-600 text-lg mb-4">{skill.description}</p>

              {/* Tags */}
              {skill.tags && skill.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {skill.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Skill ID */}
              <div className="text-sm text-gray-500">
                ID: {skill.full_id}
              </div>
            </div>

            {/* Install Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Install this agent skill to your local</h2>

              {/* Package Manager Tabs */}
              <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
                {packageManagers.map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setActivePackageManager(pm)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                      activePackageManager === pm
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Command */}
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-3">
                <code className="flex-1 text-sm text-gray-800 font-mono">
                  {getInstallCommand(activePackageManager)}
                </code>
                <button
                  onClick={copyInstallCommand}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Copy command"
                >
                  {copied ? (
                    <Check size={18} className="text-green-600" />
                  ) : (
                    <Copy size={18} className="text-gray-500" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            {/* Author Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Author</h3>
              <div className="flex items-center gap-3">
                {skill.author_avatar_url ? (
                  <img
                    src={skill.author_avatar_url}
                    alt={skill.author_name || 'Author'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {(skill.author_name || skill.repo_owner || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{skill.author_name || skill.repo_owner}</p>
                  {skill.author_url && (
                    <a
                      href={skill.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {skill.author_url}
                    </a>
                  )}
                </div>
              </div>
              {skill.author_slug && (
                <Link
                  to={`/authors/${skill.author_slug}`}
                  className="mt-3 text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  View all skills
                </Link>
              )}
            </div>

            {/* Repository Section */}
            {skill.repo_owner && skill.repo_name && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Repository</h3>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-900 hover:text-blue-600 font-medium"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  {skill.repo_owner}/{skill.repo_name}
                </a>
                <div className="text-xs text-gray-500 mt-1">{skill.repo_owner}</div>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                  {skill.repo_stars !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star size={14} />
                      {skill.repo_stars.toLocaleString()}
                    </div>
                  )}
                  {skill.repo_forks !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <GitFork size={14} />
                      {skill.repo_forks.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* License */}
                {skill.repo_license && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">License: </span>
                    <span className="text-xs font-medium text-gray-700">{skill.repo_license}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skill Files Section - Full Width */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Skill Files</h2>
          <p className="text-sm text-gray-500 mb-4">Browse the full folder contents for {skill.name}</p>

          <SkillFilesExplorer skillId={skill.full_id} skillName={skill.name} skillDescription={skill.description} />
        </div>
      </div>
    </div>
  );
}
