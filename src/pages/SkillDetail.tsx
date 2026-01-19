import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star,
  GitFork,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'

import { api } from '../services/api'
import type { Skill } from '../types'
import SkillFilesExplorer from '../components/SkillFilesExplorer'

export default function SkillDetail() {
  const { owner, repo, name } = useParams<{
    owner: string
    repo: string
    name: string
  }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activePackageManager, setActivePackageManager] = useState<
    'pnpm' | 'npm' | 'yarn' | 'bun'
  >('pnpm')

  useEffect(() => {
    const fetchSkill = async () => {
      if (!owner || !repo || !name) return
      setLoading(true)
      try {
        const response = await api.getSkill(owner, repo, name)
        setSkill(response.data)
      } catch (error) {
        console.error('Failed to fetch skill:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSkill()
  }, [owner, repo, name])

  const getInstallCommand = (pm: string) => {
    if (!skill) return ''
    const repoUrl =
      skill.repo_url ||
      `https://github.com/${skill.repo_owner}/${skill.repo_name}`
    return `${pm} dlx add-skill ${repoUrl}`
  }

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(getInstallCommand(activePackageManager))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!skill) return
    // Direct download - the backend returns the ZIP file directly
    const downloadUrl = api.downloadSkillUrl(skill.full_id)
    window.location.href = downloadUrl
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
              >
                Skills
              </Link>
              <Link
                to="/authors"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
              >
                Authors
              </Link>
              <Link
                to="/categories"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
              >
                Categories
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
              >
                Skills
              </Link>
              <Link
                to="/authors"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
              >
                Authors
              </Link>
              <Link
                to="/categories"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
              >
                Categories
              </Link>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Skill Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The skill you're looking for doesn't exist.
          </p>
          <Link
            to="/skills"
            className="text-blue-600 hover:underline font-medium"
          >
            Back to Skills
          </Link>
        </div>
      </div>
    )
  }

  const repoUrl =
    skill.repo_url ||
    `https://github.com/${skill.repo_owner}/${skill.repo_name}`
  const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <Link
              to="/skills"
              className="px-4 py-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 -mb-px"
            >
              Skills
            </Link>
            <Link
              to="/authors"
              className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors"
            >
              Authors
            </Link>
            <Link
              to="/categories"
              className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors"
            >
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Row-based grid for perfect alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
          {/* Row 1: Skill Summary + (Try with Aramb & Author) */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
                {skill.name}
              </h1>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-[13px] font-medium flex-shrink-0"
              >
                <Download size={15} />
                Download
              </button>
            </div>
            <p className="text-slate-500 text-[14px] leading-relaxed mb-5">
              {skill.description}
            </p>

            {/* Tags */}
            {skill.tags && skill.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skill.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[12px] rounded-md font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Skill ID */}
            <div className="text-[12px] text-slate-400 font-mono">
              {skill.full_id}
            </div>
          </div>

          {/* Right side of Row 1: Try with Aramb + Author */}
          <div className="flex flex-col gap-4">
            {/* Try with Aramb CTA */}
            <a
              href={`https://aramb.ai/try?skill=${encodeURIComponent(skill.full_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all text-[13px] font-medium"
            >
              <span>Try with Aramb</span>
              <ExternalLink size={13} />
            </a>

            {/* Author Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100 flex-1">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Author
              </h3>
              <div className="flex items-center gap-3">
                {skill.author_avatar_url ? (
                  <img
                    src={skill.author_avatar_url}
                    alt={skill.author_name || 'Author'}
                    className="w-10 h-10 rounded-full ring-2 ring-slate-100"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[14px] font-semibold">
                    {(skill.author_name || skill.repo_owner || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-slate-800">
                    {skill.author_name || skill.repo_owner}
                  </p>
                  {skill.author_url && (
                    <a
                      href={skill.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {skill.author_url}
                    </a>
                  )}
                </div>
              </div>
              {skill.author_slug && (
                <Link
                  to={`/authors/${skill.author_slug}`}
                  className="mt-4 text-[12px] text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  View all skills
                  <span className="text-slate-400">→</span>
                </Link>
              )}
            </div>
          </div>

          {/* Row 2: Install + Repository */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-slate-200/80 shadow-sm shadow-slate-100">
            <h2 className="text-[15px] font-semibold text-slate-800 mb-4 tracking-tight">
              Install this agent skill
            </h2>

            {/* Package Manager Tabs */}
            <div className="flex items-center gap-0.5 mb-4 border-b border-slate-200">
              {packageManagers.map(pm => (
                <button
                  key={pm}
                  onClick={() => setActivePackageManager(pm)}
                  className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px transition-all ${
                    activePackageManager === pm
                      ? 'border-slate-800 text-slate-800'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {pm}
                </button>
              ))}
            </div>

            {/* Command */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 p-3.5">
              <code className="flex-1 text-[13px] text-slate-600 font-mono">
                {getInstallCommand(activePackageManager)}
              </code>
              <button
                onClick={copyInstallCommand}
                className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                title="Copy command"
              >
                {copied ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Repository Section - aligns with Install */}
          {skill.repo_owner && skill.repo_name && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm shadow-slate-100">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Repository
              </h3>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-800 hover:text-slate-600 text-[14px] font-semibold transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {skill.repo_owner}/{skill.repo_name}
              </a>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                {skill.repo_stars !== undefined && (
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <Star
                      size={12}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                    <span className="font-medium">
                      {skill.repo_stars.toLocaleString()}
                    </span>
                  </div>
                )}
                {skill.repo_forks !== undefined && (
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
                    <GitFork size={12} />
                    <span className="font-medium">
                      {skill.repo_forks.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* License */}
              {skill.repo_license && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">License </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    {skill.repo_license}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skill Files Section - Full Width */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm shadow-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800 mb-1 tracking-tight">
            Skill Files
          </h2>
          <p className="text-[13px] text-slate-400 mb-5">
            Browse the folder contents for {skill.name}
          </p>

          <SkillFilesExplorer
            skillId={skill.full_id}
            skillName={skill.name}
            skillDescription={skill.description}
          />
        </div>
      </div>
    </div>
  )
}
