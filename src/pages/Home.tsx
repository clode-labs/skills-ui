import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Search,
  Sparkles,
  Github,
  Send,
  Download,
  X,
} from 'lucide-react'

import SkillGridCard from '../components/SkillGridCard'
import SkillListCard from '../components/SkillListCard'
import SearchableSelect from '../components/SearchableSelect'
import { api, authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Skill, Category, PaginationMeta } from '../types'
import styles from './Home.module.css'

const ITEMS_PER_PAGE = 20
const LANDING_SKILLS_LIMIT = 8

type PromptMode = 'discover' | 'build' | 'import'

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [landingSkills, setLandingSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [landingLoading, setLandingLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedLandingCategory, setSelectedLandingCategory] = useState('all')
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { isAuthenticated, signIn, user } = useAuth()
  const navigate = useNavigate()

  // Prompt section state
  const [promptMode, setPromptMode] = useState<PromptMode>('discover')
  const [promptValue, setPromptValue] = useState('')

  // Skill mention state (for Build mode)
  const [mentionQuery, setMentionQuery] = useState('')
  const [showMentionDropdown, setShowMentionDropdown] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [mentionLoading, setMentionLoading] = useState(false)
  const [mentionIndex, setMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionDropdownRef = useRef<HTMLDivElement>(null)

  const searchQuery = searchParams.get('search') || ''
  const hasSearchParam = searchParams.has('search')
  const categoryFromUrl = searchParams.get('category') || ''
  const tagsFromUrl = searchParams.get('tags') || ''
  const authorFromUrl = searchParams.get('author') || ''
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [selectedTags, setSelectedTags] = useState(tagsFromUrl)
  const [selectedAuthor, setSelectedAuthor] = useState(authorFromUrl)

  // Determine if we're on the "landing" view (no search param at all, no category, no tags, no author)
  const isLandingView =
    !hasSearchParam && !categoryFromUrl && !tagsFromUrl && !authorFromUrl

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await api.getCategories()
        setCategories(categoriesResponse.data)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Load landing page skills (featured/top skills)
  const loadLandingSkills = useCallback(async () => {
    try {
      setLandingLoading(true)
      let response

      if (selectedLandingCategory === 'all') {
        // Try featured first, fallback to first category if empty
        response = await api.getFeaturedSkills()
        if (response.data.length === 0 && categories.length > 0) {
          // Fallback: get skills from the first category
          response = await api.getCategorySkills(
            categories[0].name,
            1,
            LANDING_SKILLS_LIMIT,
          )
        }
      } else {
        response = await api.getCategorySkills(
          selectedLandingCategory,
          1,
          LANDING_SKILLS_LIMIT,
        )
      }

      setLandingSkills(response.data.slice(0, LANDING_SKILLS_LIMIT))
    } catch (error) {
      console.error('Error loading landing skills:', error)
      setLandingSkills([])
    } finally {
      setLandingLoading(false)
    }
  }, [selectedLandingCategory, categories])

  useEffect(() => {
    if (isLandingView && categories.length > 0) {
      loadLandingSkills()
    }
  }, [isLandingView, selectedLandingCategory, categories, loadLandingSkills])

  // Sync with URL params
  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
    setSelectedTags(tagsFromUrl)
    setSelectedAuthor(authorFromUrl)
    setCurrentPage(pageFromUrl)
  }, [categoryFromUrl, tagsFromUrl, authorFromUrl, pageFromUrl])

  // Only load data when NOT on landing view
  useEffect(() => {
    if (!isLandingView) {
      loadData()
    }
  }, [
    searchQuery,
    activeFilter,
    selectedCategory,
    selectedTags,
    selectedAuthor,
    currentPage,
    isLandingView,
    isAuthenticated,
  ])

  const loadData = async () => {
    try {
      setLoading(true)

      let skillsResponse
      if (activeFilter === 'featured') {
        skillsResponse = await api.getFeaturedSkills()
      } else if (selectedAuthor) {
        skillsResponse = await api.getAuthorSkills(
          selectedAuthor,
          currentPage,
          ITEMS_PER_PAGE,
        )
      } else if (selectedCategory) {
        // Filter by category
        skillsResponse = await api.getCategorySkills(
          selectedCategory,
          currentPage,
          ITEMS_PER_PAGE,
        )
      } else if (searchQuery || selectedTags) {
        // Use search API when there's a search query or tags filter
        const searchApi = isAuthenticated ? authApi : api
        skillsResponse = await searchApi.searchSkills({
          q: searchQuery || undefined,
          tag: selectedTags || undefined,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        })
      } else {
        // No filters - get all skills
        skillsResponse = await api.getSkills({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        })
      }

      setSkills(skillsResponse.data)
      setPagination(skillsResponse.pagination || null)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch skill suggestions for mentions
  useEffect(() => {
    if (!showMentionDropdown || mentionQuery.length < 1) {
      setMentionSuggestions([])
      return
    }

    const fetchMentionSuggestions = async () => {
      setMentionLoading(true)
      try {
        const searchApi = isAuthenticated ? authApi : api
        const response = await searchApi.searchSkills({ q: mentionQuery })
        // Filter out already selected skills
        const filtered = response.data.filter(
          skill => !selectedSkills.some(s => s.id === skill.id),
        )
        setMentionSuggestions(filtered.slice(0, 8))
      } catch (error) {
        console.error('Error fetching mention suggestions:', error)
      } finally {
        setMentionLoading(false)
      }
    }

    const debounce = setTimeout(fetchMentionSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [mentionQuery, showMentionDropdown, isAuthenticated, selectedSkills])

  // Close mention dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowMentionDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle textarea change for @ mentions
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setPromptValue(value)

    // Only handle mentions in Build mode
    if (promptMode !== 'build') {
      setShowMentionDropdown(false)
      return
    }

    // Find if we're typing after an @
    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPos)
    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1)
      // Check if there's no space after @ (still typing the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt)
        setShowMentionDropdown(true)
        setMentionIndex(0)
        return
      }
    }

    setShowMentionDropdown(false)
    setMentionQuery('')
  }

  // Select a skill from mention dropdown
  const handleSelectMention = (skill: Skill) => {
    // Add to selected skills
    setSelectedSkills(prev => [...prev, skill])

    // Remove the @query from the text
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart || 0
      const textBeforeCursor = promptValue.slice(0, cursorPos)
      const atIndex = textBeforeCursor.lastIndexOf('@')
      const textAfterCursor = promptValue.slice(cursorPos)

      const newValue =
        promptValue.slice(0, atIndex) + textAfterCursor.trimStart()
      setPromptValue(newValue)
    }

    setShowMentionDropdown(false)
    setMentionQuery('')
    textareaRef.current?.focus()
  }

  // Remove a selected skill
  const handleRemoveSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(s => s.id !== skillId))
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
    setSelectedTags('')
    setActiveFilter('all')
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    params.delete('tags')
    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }
    setSearchParams(params)
  }

  const handleLandingCategoryChange = (category: string) => {
    setSelectedLandingCategory(category)
  }

  const clearTagFilter = () => {
    setSelectedTags('')
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    params.delete('tags')
    setSearchParams(params)
  }

  const clearAuthorFilter = () => {
    setSelectedAuthor('')
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    params.delete('page')
    params.delete('author')
    setSearchParams(params)
  }

  const handlePromptSubmit = () => {
    if (!promptValue.trim()) return

    if (promptMode === 'discover') {
      navigate(`/?search=${encodeURIComponent(promptValue.trim())}`)
    } else if (promptMode === 'import') {
      if (isAuthenticated) {
        navigate('/import')
      } else {
        signIn('/import')
      }
    }
    setPromptValue('')
  }

  const handlePromptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle mention dropdown navigation
    if (showMentionDropdown && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(prev =>
          prev < mentionSuggestions.length - 1 ? prev + 1 : 0,
        )
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(prev =>
          prev > 0 ? prev - 1 : mentionSuggestions.length - 1,
        )
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleSelectMention(mentionSuggestions[mentionIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentionDropdown(false)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePromptSubmit()
    }
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

  // Landing view - Prompt Section + Top Skills grid
  if (isLandingView) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
        {/* Prompt Section */}
        <div className={styles.promptSection}>
          <p className={styles.greeting}>
            {isAuthenticated && user ? `Hi, ${user.name}!` : 'Hi There!'}
          </p>
          <h1 className={styles.mainQuestion}>What's your next big idea?</h1>
          <p className={styles.subtitle}>
            Discover. Build. Share.{' '}
            <span className={styles.subtitleHighlight}>
              Powerful skills for AI agents.
            </span>
          </p>

          {/* Input Wrapper */}
          <div className={styles.inputWrapper}>
            {/* Mode Tabs */}
            <div className={styles.modeTabsContainer}>
              <button
                className={`${styles.modeTab} ${promptMode === 'discover' ? styles.modeTabActive : ''}`}
                onClick={() => setPromptMode('discover')}
              >
                <Search size={16} />
                <span>Discover</span>
              </button>
              <button
                className={`${styles.modeTab} ${promptMode === 'build' ? styles.modeTabActive : ''}`}
                onClick={() => setPromptMode('build')}
              >
                <Send size={16} />
                <span>Build</span>
              </button>
              <button
                className={`${styles.modeTab} ${promptMode === 'import' ? styles.modeTabActive : ''}`}
                onClick={() => setPromptMode('import')}
              >
                <Download size={16} />
                <span>Import</span>
              </button>
            </div>

            {/* Input Container */}
            <div className={styles.inputContainer}>
              {/* Selected Skills Chips (for Build mode) */}
              {promptMode === 'build' && selectedSkills.length > 0 && (
                <div className={styles.selectedSkills}>
                  {selectedSkills.map(skill => (
                    <span key={skill.id} className={styles.skillChip}>
                      <span className={styles.skillChipAt}>@</span>
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.id)}
                        className={styles.skillChipRemove}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.textareaWrapper}>
                <textarea
                  ref={textareaRef}
                  value={promptValue}
                  onChange={handlePromptChange}
                  onKeyDown={handlePromptKeyDown}
                  placeholder={
                    promptMode === 'discover'
                      ? 'Search for skills... e.g. "file management", "API integration"'
                      : promptMode === 'build'
                        ? 'Describe what you want to build... Type @ to mention skills'
                        : 'Paste a GitHub URL to import a skill...'
                  }
                  className={styles.promptInput}
                  rows={2}
                />

                {/* Mention Dropdown */}
                {showMentionDropdown && promptMode === 'build' && (
                  <div
                    ref={mentionDropdownRef}
                    className={styles.mentionDropdown}
                  >
                    {mentionLoading ? (
                      <div className={styles.mentionLoading}>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Searching skills...</span>
                      </div>
                    ) : mentionSuggestions.length > 0 ? (
                      <ul className={styles.mentionList}>
                        {mentionSuggestions.map((skill, index) => (
                          <li key={skill.id}>
                            <button
                              type="button"
                              onClick={() => handleSelectMention(skill)}
                              className={`${styles.mentionItem} ${
                                index === mentionIndex
                                  ? styles.mentionItemActive
                                  : ''
                              }`}
                            >
                              <div className={styles.mentionItemHeader}>
                                <div className={styles.mentionItemName}>
                                  {skill.name}
                                </div>
                                {skill.repo_owner && skill.repo_name && (
                                  <span className={styles.mentionItemRepo}>
                                    {skill.repo_owner}/{skill.repo_name}
                                  </span>
                                )}
                              </div>
                              <div className={styles.mentionItemDesc}>
                                {skill.description}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : mentionQuery.length > 0 ? (
                      <div className={styles.mentionEmpty}>
                        No skills found for "{mentionQuery}"
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              <div className={styles.inputActions}>
                <div className={styles.inputActionsLeft}>
                  <button
                    className={styles.actionButton}
                    title="Add from GitHub"
                  >
                    <Github size={16} />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="AI Suggestions"
                  >
                    <Sparkles size={16} />
                  </button>
                  <button
                    className={styles.actionButton}
                    title="Add attachment"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className={styles.inputActionsRight}>
                  <button
                    className={styles.sendButton}
                    onClick={handlePromptSubmit}
                    disabled={!promptValue.trim()}
                    title={
                      promptMode === 'discover'
                        ? 'Search'
                        : promptMode === 'build'
                          ? 'Build'
                          : 'Import'
                    }
                  >
                    {promptMode === 'discover' && (
                      <Search size={18} color="#fff" />
                    )}
                    {promptMode === 'build' && <Send size={18} color="#fff" />}
                    {promptMode === 'import' && (
                      <Download size={18} color="#fff" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Skills Section */}
        <div className="max-w-6xl mx-auto px-4">
          <div className={styles.skillsSection}>
            {/* Section Header */}
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <h2 className={styles.sectionTitle}>Top Skills</h2>
                <p className={styles.sectionSubtitle}>
                  Explore what the community is building
                </p>
              </div>
              <Link to="/skills?search=" className={styles.viewAllLink}>
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className={styles.categoryFilters}>
              <button
                onClick={() => handleLandingCategoryChange('all')}
                className={`${styles.categoryButton} ${
                  selectedLandingCategory === 'all'
                    ? styles.categoryButtonActive
                    : ''
                }`}
              >
                All
              </button>
              {categories.slice(0, 5).map(category => (
                <button
                  key={category.id}
                  onClick={() => handleLandingCategoryChange(category.name)}
                  className={`${styles.categoryButton} ${
                    selectedLandingCategory === category.name
                      ? styles.categoryButtonActive
                      : ''
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Skills Grid */}
            {landingLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-500" size={28} />
              </div>
            ) : landingSkills.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500 text-[14px]">No skills found</p>
              </div>
            ) : (
              <div className={styles.skillsGrid}>
                {landingSkills.map(skill => (
                  <SkillGridCard key={skill.id} skill={skill} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Search results / All skills view
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[15px] font-semibold text-slate-900 dark:text-white">
            {searchQuery ? (
              <>
                {totalSkills.toLocaleString()} results for "{searchQuery}"
              </>
            ) : (
              <>{totalSkills.toLocaleString()} skills found</>
            )}
          </div>

          {/* Dropdowns */}
          <div className="flex items-center gap-3">
            {/* Category dropdown */}
            <SearchableSelect
              options={[
                { value: '', label: 'All Categories' },
                ...categories.map(cat => ({
                  value: cat.name,
                  label: cat.name,
                })),
              ]}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
            />

            {/* Sort dropdown */}
            <select
              value={activeFilter}
              onChange={e => handleFilterChange(e.target.value)}
              className="text-[13px] px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
            >
              {filters.map(filter => (
                <option key={filter.id} value={filter.id}>
                  Sort: {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(selectedTags || selectedAuthor || selectedCategory) && (
          <div className="flex items-center gap-2 mb-4">
            {selectedCategory && (
              <button
                onClick={() => handleCategoryChange('')}
                className="text-[12px] px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center gap-1"
              >
                {selectedCategory} <span className="ml-1">×</span>
              </button>
            )}
            {selectedTags && (
              <button
                onClick={clearTagFilter}
                className="text-[12px] px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center gap-1"
              >
                {selectedTags} <span className="ml-1">×</span>
              </button>
            )}
            {selectedAuthor && (
              <button
                onClick={clearAuthorFilter}
                className="text-[12px] px-2.5 py-1 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors flex items-center gap-1"
              >
                @{selectedAuthor} <span className="ml-1">×</span>
              </button>
            )}
          </div>
        )}

        {/* Skills List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-400" size={24} />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400 text-[14px]">
              No skills found
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {skills.map(skill => (
                <SkillListCard key={skill.id} skill={skill} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-2">
                <div className="text-[13px] text-slate-500 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalSkills)} of{' '}
                  {totalSkills.toLocaleString()}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-1 text-slate-400 dark:text-slate-600 text-[13px]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-9 h-9 rounded-lg text-[13px] font-medium transition-all ${
                          currentPage === page
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
