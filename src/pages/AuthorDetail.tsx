import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Loader2 } from 'lucide-react'

import { api } from '../services/api'
import type { Author, Skill, PaginationMeta } from '../types'
import SkillCard from '../components/SkillCard'

export default function AuthorDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [author, setAuthor] = useState<Author | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!slug) return
      setLoading(true)
      try {
        const [authorRes, skillsRes] = await Promise.all([
          api.getAuthor(slug),
          api.getAuthorSkills(slug, page, 20),
        ])
        setAuthor(authorRes.data)
        setSkills(skillsRes.data)
        setPagination(skillsRes.pagination)
      } catch (error) {
        console.error('Failed to fetch author:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuthor()
  }, [slug, page])

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Skills
              </Link>
              <Link
                to="/authors"
                className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
              >
                Authors
              </Link>
              <Link
                to="/categories"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
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

  if (!author) {
    return (
      <div className="bg-white min-h-screen">
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <nav className="flex items-center gap-6">
              <Link
                to="/skills"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Skills
              </Link>
              <Link
                to="/authors"
                className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
              >
                Authors
              </Link>
              <Link
                to="/categories"
                className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Categories
              </Link>
            </nav>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-gray-500">Author not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-6">
            <Link
              to="/skills"
              className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Skills
            </Link>
            <Link
              to="/authors"
              className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
            >
              Authors
            </Link>
            <Link
              to="/categories"
              className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Author Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
              {author.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {author.name || author.slug}
            </h1>
            {author.url && (
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                {author.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {author.skill_count} skill{author.skill_count !== 1 ? 's' : ''}{' '}
              published
            </p>
          </div>
        </div>

        {/* Skills Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {skills.length} skill{skills.length !== 1 ? 's' : ''} by{' '}
            {author.name || author.slug}
          </h2>
        </div>

        {/* Skills List */}
        {skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No skills found</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {skills.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {pagination.total_pages}
            </span>
            <button
              onClick={() =>
                setPage(p => Math.min(pagination.total_pages, p + 1))
              }
              disabled={page === pagination.total_pages}
              className="px-4 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
