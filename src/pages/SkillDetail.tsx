import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Star,
  GitFork,
  Copy,
  Check,
  Download,
  ExternalLink,
  FileText,
  Package,
  Folder,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

import { api, authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Skill, FileNode } from '../types'

type TabType = 'skill' | 'files'

// Helper to strip metadata from SKILL.md content
function stripSkillMetadata(content: string): string {
  // First check for standard YAML frontmatter with ---
  if (content.startsWith('---')) {
    const endIndex = content.indexOf('---', 3)
    if (endIndex !== -1) {
      return content.slice(endIndex + 3).trim()
    }
  }

  // Handle SKILL.md format where metadata is plain text at the beginning
  // e.g., "name: skill-name\ndescription: some description\n\n# Content"
  const lines = content.split('\n')
  let contentStartIndex = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    // Skip empty lines at the beginning
    if (line === '') {
      contentStartIndex = i + 1
      continue
    }
    // Check if line looks like metadata (key: value format)
    if (/^(name|description|version|author|tags|category):/i.test(line)) {
      contentStartIndex = i + 1
      continue
    }
    // Found actual content - stop here
    break
  }

  // Return content from the first non-metadata line
  return lines.slice(contentStartIndex).join('\n').trim()
}

export default function SkillDetail() {
  const { owner, repo, name } = useParams<{
    owner: string
    repo: string
    name: string
  }>()
  const { isAuthenticated } = useAuth()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('skill')
  const [readmeContent, setReadmeContent] = useState<string>('')
  const [readmeLoading, setReadmeLoading] = useState(false)
  const [tree, setTree] = useState<FileNode | null>(null)
  const [currentPath, setCurrentPath] = useState<string[]>([])

  useEffect(() => {
    const fetchSkill = async () => {
      if (!owner || !repo || !name) return
      setLoading(true)
      try {
        // Use authenticated endpoint when logged in to access private skills
        const skillApi = isAuthenticated ? authApi : api
        const response = await skillApi.getSkill(owner, repo, name)
        setSkill(response.data)
      } catch (error) {
        console.error('Failed to fetch skill:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSkill()
  }, [owner, repo, name, isAuthenticated])

  // Fetch readme content when skill loads
  useEffect(() => {
    const fetchReadme = async () => {
      if (!skill) return
      setReadmeLoading(true)
      try {
        // Use authenticated endpoints when logged in
        const skillApi = isAuthenticated ? authApi : api

        // First get the file tree
        const treeResponse = await skillApi.getSkillTree(skill.full_id)
        setTree(treeResponse.data)

        // Try to find SKILL.md or README.md
        const findFile = (node: FileNode, name: string): FileNode | null => {
          if (
            node.name.toLowerCase() === name.toLowerCase() &&
            node.type === 'file'
          )
            return node
          if (node.children) {
            for (const child of node.children) {
              const found = findFile(child, name)
              if (found) return found
            }
          }
          return null
        }

        const skillMd = findFile(treeResponse.data, 'SKILL.md')
        const readmeMd = findFile(treeResponse.data, 'README.md')
        const fileToLoad = skillMd || readmeMd

        if (fileToLoad) {
          // Get relative path
          let relativePath = fileToLoad.path
          const treePath = treeResponse.data.path || ''
          if (treePath && relativePath.startsWith(treePath + '/')) {
            relativePath = relativePath.slice(treePath.length + 1)
          } else if (treePath && relativePath.startsWith(treePath)) {
            relativePath = relativePath
              .slice(treePath.length)
              .replace(/^\//, '')
          }
          if (!relativePath && fileToLoad.name) {
            relativePath = fileToLoad.name
          }

          const fileResponse = await skillApi.getSkillFile(
            skill.full_id,
            relativePath,
          )
          setReadmeContent(fileResponse.content)
        }
      } catch (error) {
        console.error('Failed to fetch readme:', error)
      } finally {
        setReadmeLoading(false)
      }
    }
    fetchReadme()
  }, [skill, isAuthenticated])

  const getInstallCommand = () => {
    if (!skill) return ''
    const repoUrl =
      skill.repo_url ||
      `https://github.com/${skill.repo_owner}/${skill.repo_name}`
    return `npx add-skill ${repoUrl}`
  }

  const copyInstallCommand = () => {
    navigator.clipboard.writeText(getInstallCommand())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!skill) return
    // Use authenticated endpoint when logged in
    const skillApi = isAuthenticated ? authApi : api
    const downloadUrl = skillApi.downloadSkillUrl(skill.full_id)
    window.location.href = downloadUrl
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Get the current folder node based on currentPath
  const getCurrentFolderChildren = (): FileNode[] => {
    if (!tree || !tree.children) return []
    if (currentPath.length === 0) return tree.children

    let current = tree
    for (const segment of currentPath) {
      const found = current.children?.find(
        child => child.name === segment && child.type === 'dir',
      )
      if (!found) return []
      current = found
    }
    return current.children || []
  }

  const navigateToFolder = (folderName: string) => {
    setCurrentPath(prev => [...prev, folderName])
  }

  const navigateToPathIndex = (index: number) => {
    setCurrentPath(prev => prev.slice(0, index))
  }

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen">
        <div className="border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f172a]">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-slate-900 dark:text-white border-b-2 border-violet-500"
              >
                Skills
              </Link>
            </nav>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-slate-500" size={32} />
        </div>
      </div>
    )
  }

  if (!skill) {
    return (
      <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen">
        <div className="border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f172a]">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-slate-900 dark:text-white border-b-2 border-violet-500"
              >
                Skills
              </Link>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Skill Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The skill you're looking for doesn't exist.
          </p>
          <Link
            to="/skills"
            className="text-violet-600 dark:text-violet-400 hover:underline font-medium"
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

  const tabs = [
    { id: 'skill' as TabType, label: 'Skill', icon: FileText },
    { id: 'files' as TabType, label: 'Files', icon: Package },
  ]

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <Link
              to="/skills"
              className="px-4 py-3 text-[13px] font-semibold text-slate-900 dark:text-white border-b-2 border-violet-500 -mb-px"
            >
              Skills
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {skill.name}
            </h1>
            {skill.is_private ? (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                <Lock size={12} />
                Private
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded">
                Public
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              1.0.0
            </span>
            <span>•</span>
            <span>Published {formatDate(skill.created_at)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700/50 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'skill' && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
                {readmeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2
                      className="animate-spin text-slate-500"
                      size={24}
                    />
                  </div>
                ) : readmeContent ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside ml-6 mb-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                            {children}
                          </li>
                        ),
                        code: ({ className, children }) => {
                          const isInline = !className
                          if (isInline) {
                            return (
                              <code className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            )
                          }
                          return (
                            <code className="block bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                              {children}
                            </code>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="mb-4">{children}</pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-slate-300 dark:border-slate-600 pl-4 italic text-slate-600 dark:text-slate-400 my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-violet-600 dark:text-violet-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {stripSkillMetadata(readmeContent)}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No skill documentation available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center">
                    <button
                      onClick={() => navigateToPathIndex(0)}
                      className={`text-sm font-medium transition-colors ${
                        currentPath.length === 0
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer'
                      }`}
                    >
                      {skill.name}
                    </button>
                    {currentPath.map((segment, index) => (
                      <span key={index} className="flex items-center">
                        <ChevronRight
                          size={14}
                          className="mx-1 text-slate-500"
                        />
                        <button
                          onClick={() => navigateToPathIndex(index + 1)}
                          className={`text-sm font-medium transition-colors ${
                            index === currentPath.length - 1
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer'
                          }`}
                        >
                          {segment}
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700/50">
                  {tree ? (
                    getCurrentFolderChildren().length > 0 ? (
                      getCurrentFolderChildren().map(node => (
                        <div
                          key={node.path}
                          onClick={() =>
                            node.type === 'dir' && navigateToFolder(node.name)
                          }
                          className={`flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/30 ${
                            node.type === 'dir' ? 'cursor-pointer' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {node.type === 'dir' ? (
                              <Folder size={16} className="text-amber-500" />
                            ) : (
                              <FileText size={16} className="text-slate-500" />
                            )}
                            <span className="text-sm text-slate-700 dark:text-slate-300">
                              {node.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>
                              {node.type === 'dir' ? 'folder' : 'file'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        This folder is empty
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      Loading files...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Install Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Install
              </h3>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-2.5">
                <code className="flex-1 text-xs text-slate-700 dark:text-slate-300 font-mono truncate">
                  {getInstallCommand()}
                </code>
                <button
                  onClick={copyInstallCommand}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors flex-shrink-0"
                  title="Copy command"
                >
                  {copied ? (
                    <Check
                      size={14}
                      className="text-emerald-500 dark:text-emerald-400"
                    />
                  ) : (
                    <Copy size={14} className="text-slate-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Category Section */}
            {(skill.category || skill.category_name || skill.category_slug) && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Category
                </h3>
                <Link
                  to={`/skills?category=${skill.category_slug || skill.category}`}
                  className="inline-flex items-center px-2.5 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs rounded-md font-medium hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors"
                >
                  {skill.category || skill.category_name || skill.category_slug}
                </Link>
                <Link
                  to={`/skills?category=${skill.category_slug || skill.category}`}
                  className="block mt-2 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  View all skills →
                </Link>
              </div>
            )}

            {/* Tags Section */}
            {skill.tags && skill.tags.length > 0 && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skill.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/skills?tags=${tag}`}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all text-sm font-medium"
              >
                <Download size={16} />
                Download
              </button>
              <a
                href={`https://aramb.ai/try?skill=${encodeURIComponent(skill.full_id)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-all text-sm font-medium"
              >
                <span>Try with Aramb</span>
                <ExternalLink size={14} />
              </a>
            </div>

            {/* Repository Section */}
            {skill.repo_owner && skill.repo_name && (
              <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Repository
                </h3>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
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
              </div>
            )}

            {/* Stats Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Version */}
                  <div>
                    <div className="text-xs text-slate-500">Version</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      1.0.0
                    </div>
                  </div>

                  {/* License */}
                  {skill.repo_license && (
                    <div>
                      <div className="text-xs text-slate-500">License</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {skill.repo_license}
                      </div>
                    </div>
                  )}
                </div>

                {/* GitHub Stats */}
                {(skill.repo_stars !== undefined ||
                  skill.repo_forks !== undefined) && (
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3 flex items-center gap-4">
                    {skill.repo_stars !== undefined && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star
                          size={14}
                          className="text-amber-500 dark:text-amber-400"
                          fill="currentColor"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {skill.repo_stars.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {skill.repo_forks !== undefined && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <GitFork size={14} className="text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {skill.repo_forks.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Last Publish */}
                <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3">
                  <div className="text-xs text-slate-500">Last publish</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(skill.updated_at || skill.created_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Author Section */}
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Author
              </h3>
              <div className="flex items-center gap-3">
                {skill.author_avatar_url ? (
                  <img
                    src={skill.author_avatar_url}
                    alt={skill.author_name || 'Author'}
                    className="w-10 h-10 rounded-full ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 text-sm font-semibold">
                    {(skill.author_name || skill.repo_owner || '?')
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {skill.author_name || skill.repo_owner}
                  </p>
                  {skill.author_slug && (
                    <Link
                      to={`/skills?author=${skill.author_slug}`}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                    >
                      View all skills →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
