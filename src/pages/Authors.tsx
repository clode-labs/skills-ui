import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <Link
              to="/skills"
              className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors"
            >
              Skills
            </Link>
            <Link
              to="/authors"
              className="px-4 py-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 -mb-px"
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

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with count */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {pagination?.total_items || 0} authors
          </h2>
        </div>

        {/* Authors List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={28} />
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-[14px]">No authors found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-100 overflow-hidden">
            {authors.map((author, index) => (
              <Link
                key={author.slug}
                to={`/authors/${author.slug}`}
                className={`block px-5 py-4 hover:bg-slate-50 transition-colors ${
                  index !== authors.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-10 h-10 rounded-full ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold text-sm">
                      {author.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-slate-900 hover:text-violet-600 transition-colors">
                      {author.name || author.slug}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-[13px] text-slate-500">
                      <span>
                        {author.skill_count} skill
                        {author.skill_count !== 1 ? 's' : ''}
                      </span>
                      {author.url && (
                        <span className="text-slate-400 truncate">
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
          <div className="flex items-center justify-between pt-6 mt-2">
            <div className="text-[12px] text-slate-400">
              Page {page} of {pagination.total_pages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                onClick={() =>
                  setPage(p => Math.min(pagination.total_pages, p + 1))
                }
                disabled={page === pagination.total_pages}
                className="flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
