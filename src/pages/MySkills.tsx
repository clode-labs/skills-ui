import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Loader2, Plus, ChevronLeft, ChevronRight, Lock } from 'lucide-react'

import SkillCard from '../components/SkillCard'
import { authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Skill, PaginationMeta } from '../types'

const ITEMS_PER_PAGE = 20

const MySkills = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Sync with URL params
  useEffect(() => {
    setCurrentPage(pageFromUrl)
  }, [pageFromUrl])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [currentPage, isAuthenticated])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await authApi.getPrivateSkills(
        currentPage,
        ITEMS_PER_PAGE,
      )
      setSkills(response.data)
      setPagination(response.pagination || null)
    } catch (error) {
      console.error('Error loading private skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const params = new URLSearchParams(searchParams)
    if (newPage === 1) {
      params.delete('page')
    } else {
      params.set('page', newPage.toString())
    }
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalSkills = pagination?.total_items || skills.length
  const totalPages = pagination?.total_pages || 1

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    return pages
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="bg-[#0f172a] min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-500" size={32} />
      </div>
    )
  }

  return (
    <div className="bg-[#0f172a] min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-700/50 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-6">
            <Link
              to="/skills"
              className="py-3 px-1 text-sm font-medium text-slate-400 hover:text-white border-b-2 border-transparent hover:border-slate-600"
            >
              Skills
            </Link>
            <Link
              to="/my-skills"
              className="py-3 px-1 text-sm font-medium text-white border-b-2 border-violet-500 flex items-center gap-1.5"
            >
              <Lock size={14} />
              My Skills
            </Link>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock size={18} className="text-slate-500" />
              My Private Skills
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              These skills are only visible to you
            </p>
          </div>

          <Link
            to="/import"
            className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors"
          >
            <Plus size={16} />
            Submit Skill
          </Link>
        </div>

        {/* Skills List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-500" size={32} />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-700 rounded-lg bg-slate-800/30">
            <Lock size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No private skills yet
            </h3>
            <p className="text-slate-500 mb-4">
              Submit a skill and mark it as private to see it here
            </p>
            <Link
              to="/import"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} />
              Submit Your First Private Skill
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-500">
              {totalSkills} private {totalSkills === 1 ? 'skill' : 'skills'}
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-6">
                <div className="text-sm text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalSkills)} of{' '}
                  {totalSkills} skills
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-3 py-1 text-slate-600"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MySkills
