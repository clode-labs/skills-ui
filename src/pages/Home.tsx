import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Loader2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import SkillCard from '../components/SkillCard'
import { api, authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Skill, Category, PaginationMeta } from '../types'

const ITEMS_PER_PAGE = 20

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()

  const searchQuery = searchParams.get('search') || ''
  const categoryFromUrl = searchParams.get('category') || ''
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)

  // Determine if we're on the "landing" view (no search, no category)
  const isLandingView = !searchQuery && !categoryFromUrl

  // Sync with URL params
  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
    setCurrentPage(pageFromUrl)
  }, [categoryFromUrl, pageFromUrl])

  // Only load data when NOT on landing view
  useEffect(() => {
    if (!isLandingView) {
      loadData()
    }
  }, [searchQuery, activeFilter, selectedCategory, currentPage, isLandingView, isAuthenticated])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load categories for filter dropdown
      const categoriesResponse = await api.getCategories()
      setCategories(categoriesResponse.data)

      // Load skills based on filters
      // Use authenticated search when logged in to include private skills
      let skillsResponse
      if (searchQuery) {
        const searchApi = isAuthenticated ? authApi : api
        skillsResponse = await searchApi.searchSkills(
          searchQuery,
          currentPage,
          ITEMS_PER_PAGE,
        )
      } else if (activeFilter === 'featured') {
        skillsResponse = await api.getFeaturedSkills()
      } else {
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        }
        if (activeFilter !== 'all') {
          params.status = activeFilter
        }
        if (selectedCategory) {
          params.category = selectedCategory
        }
        skillsResponse = await api.getSkills(params)
      }

      setSkills(skillsResponse.data)
      setPagination(skillsResponse.pagination || null)
    } catch (error) {
      console.error('Error loading data:', error)
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

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    setSearchParams(params)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setActiveFilter('all')
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    setSearchParams(params)
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'approved', label: 'Latest' },
  ]

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

  // Handle Submit Skill button click
  const handleSubmitSkill = () => {
    if (isAuthenticated) {
      navigate('/import')
    } else {
      // Trigger sign in with redirect to import page
      signIn('/import')
    }
  }

  // Landing view - only show hero section
  if (isLandingView) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-4 pt-28 pb-10 md:pt-36 md:pb-14 w-full">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Build amazing
              <br />
              agents
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto">
              The Agent Skills Registry is your destination for discovering and
              sharing powerful skills that extend AI agent capabilities.
            </p>
            <p className="text-base text-slate-500 mb-10 max-w-xl mx-auto">
              Take your agent development up a notch
            </p>

            {/* Submit Skill Button */}
            <button
              onClick={handleSubmitSkill}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus size={20} />
              Submit Skill
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Search results view
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

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with count and filters */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-900 dark:text-white">
            {searchQuery ? (
              <>
                {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'} found for
                "{searchQuery}"
              </>
            ) : activeFilter === 'featured' ? (
              'Featured Skills'
            ) : selectedCategory ? (
              `${selectedCategory} Skills`
            ) : (
              `${totalSkills} skills`
            )}
          </h2>

          <div className="flex items-center gap-2">
            <select
              value={activeFilter}
              onChange={e => handleFilterChange(e.target.value)}
              className="text-[13px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-slate-600 focus:border-violet-500 dark:focus:border-slate-600 transition-all cursor-pointer"
            >
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
              className="text-[13px] px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-slate-600 focus:border-violet-500 dark:focus:border-slate-600 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Skills List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-500" size={28} />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 text-[14px]">No skills found</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-2">
                <div className="text-[12px] text-slate-500">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalSkills)} of{' '}
                  {totalSkills}
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-1 text-slate-400 dark:text-slate-600 text-[13px]"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-all ${
                          currentPage === page
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
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

export default Home
