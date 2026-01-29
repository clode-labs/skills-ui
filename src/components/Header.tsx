import { Search, Lock } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { api, authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import clodeLogo from '../assets/images/clode_logo.png'
import type { Skill } from '../types'

interface HeaderProps {
  onSearch?: (query: string) => void
}

const Header = ({ onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Skill[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, isLoading, signIn, signUp, signOut } =
    useAuth()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        return
      }
      setLoading(true)
      try {
        // Use authenticated search when logged in to include private skills
        const searchApi = isAuthenticated ? authApi : api
        const response = await searchApi.searchSkills({ q: searchQuery })
        setSuggestions(response.data.slice(0, 5))
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery, isAuthenticated])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery)
      } else {
        navigate(`/skills?search=${encodeURIComponent(searchQuery)}`)
      }
    }
  }

  return (
    <header className="bg-white dark:bg-black sticky top-0 z-50 border-b border-slate-200 dark:border-transparent">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={clodeLogo}
              alt="Clode"
              className={`w-9 h-9 ${resolvedTheme === 'light' ? 'invert' : ''}`}
            />
          </Link>

          {/* Search Bar - npm style large */}
          <div ref={searchRef} className="flex-1 relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search skills"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-white border border-slate-300 dark:border-0 rounded text-base focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-white text-gray-900 placeholder-gray-400"
                />
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
                {loading ? (
                  <div className="p-4 text-gray-500 dark:text-slate-400 text-[15px]">
                    Searching...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-[320px] overflow-y-auto">
                    {suggestions.map(skill => (
                      <li key={skill.id}>
                        <Link
                          to={`/skills/${skill.full_id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 border-b border-gray-100 dark:border-slate-700 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center gap-2 font-semibold text-[16px] text-gray-900 dark:text-white">
                            {skill.name}
                            {skill.is_private && (
                              <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-[11px] font-medium rounded">
                                <Lock size={10} />
                                Private
                              </span>
                            )}
                          </div>
                          <div className="text-[14px] text-gray-500 dark:text-slate-400 truncate mt-1">
                            {skill.description}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-gray-500 dark:text-slate-400 text-[15px]">
                    No skills found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 shrink-0 text-sm">
            <ThemeToggle />
            {isLoading ? (
              <div className="w-20 h-8 bg-slate-200 dark:bg-gray-700 animate-pulse rounded"></div>
            ) : isAuthenticated && user ? (
              // Authenticated user menu
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-700 dark:text-white">
                        {user.name?.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase() ||
                          'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-slate-700 dark:text-white/80 text-sm hidden md:block">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Guest buttons
              <>
                <button
                  onClick={() => signIn()}
                  className="text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => signUp()}
                  className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
