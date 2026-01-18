import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { api } from '../services/api'
import type { Author, PaginationMeta } from '../types'

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true)
      try {
        const response = await api.getAuthors(page, 24)
        setAuthors(response.data)
        setPagination(response.pagination)
      } catch (error) {
        console.error('Failed to fetch authors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [page])

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
        {/* Header with count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {pagination?.total_items || 0} authors
          </h2>
        </div>

        {/* Authors List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No authors found</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {authors.map(author => (
              <Link
                key={author.slug}
                to={`/authors/${author.slug}`}
                className="block border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {author.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-blue-600 hover:underline">
                      {author.name || author.slug}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {author.skill_count} skill
                        {author.skill_count !== 1 ? 's' : ''}
                      </span>
                      {author.url && (
                        <span className="text-gray-400">
                          {author.url.replace('https://', '')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
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
