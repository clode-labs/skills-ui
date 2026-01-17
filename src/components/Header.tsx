import { Search, Plus, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Skill } from '../types';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header = ({ onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, signIn, signUp, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const response = await api.searchSkills(searchQuery);
        setSuggestions(response.data.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/skills?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-black font-bold text-sm">as</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search skills"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border-0 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white text-gray-900"
                />
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded shadow-lg border border-gray-200 overflow-hidden z-50">
                {loading ? (
                  <div className="p-3 text-gray-500 text-sm">Searching...</div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((skill) => (
                      <li key={skill.id}>
                        <Link
                          to={`/skills/${skill.full_id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="block px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-gray-900">{skill.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {skill.description}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-gray-500 text-sm">No skills found</div>
                )}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="flex items-center gap-3 shrink-0 text-sm">
            <Link
              to="/import"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 transition-colors"
            >
              <Plus size={16} />
              Submit Skill
            </Link>

            {isLoading ? (
              <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
            ) : isAuthenticated && user ? (
              // Authenticated user menu
              <div className="flex items-center gap-3">
                <Link
                  to="/my-skills"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                >
                  <Lock size={14} />
                  My Skills
                </Link>
                <div className="flex items-center gap-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-white/80 text-sm hidden md:block">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Guest buttons
              <>
                <button
                  onClick={signIn}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={signUp}
                  className="px-3 py-1.5 bg-white text-black rounded font-medium hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
