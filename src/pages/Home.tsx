import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SkillCard from '../components/SkillCard';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Skill, Category, PaginationMeta } from '../types';
import { Loader2, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { isAuthenticated } = useAuth();

  const searchQuery = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);

  // Sync with URL params
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
    setCurrentPage(pageFromUrl);
  }, [categoryFromUrl, pageFromUrl]);

  useEffect(() => {
    loadData();
  }, [searchQuery, activeFilter, selectedCategory, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories
      const categoriesResponse = await api.getCategories();
      setCategories(categoriesResponse.data);

      // Load skills based on filters
      let skillsResponse;
      if (searchQuery) {
        skillsResponse = await api.searchSkills(searchQuery, currentPage, ITEMS_PER_PAGE);
      } else if (activeFilter === 'featured') {
        skillsResponse = await api.getFeaturedSkills();
      } else {
        const params: Record<string, string> = {
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        };
        if (activeFilter !== 'all') {
          params.status = activeFilter;
        }
        if (selectedCategory) {
          params.category = selectedCategory;
        }
        skillsResponse = await api.getSkills(params);
      }

      setSkills(skillsResponse.data);
      setPagination(skillsResponse.pagination || null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Update URL with page param
    const params = new URLSearchParams(searchParams);
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }
    setSearchParams(params);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setActiveFilter('all');
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'approved', label: 'Latest' },
  ];

  const totalSkills = pagination?.total_items || skills.length;
  const totalPages = pagination?.total_pages || 1;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <Link to="/skills" className="px-4 py-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 -mb-px">
              Skills
            </Link>
            {isAuthenticated && (
              <Link to="/my-skills" className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px flex items-center gap-1.5 transition-colors">
                <Lock size={13} />
                My Skills
              </Link>
            )}
            <Link to="/authors" className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors">
              Authors
            </Link>
            <Link to="/categories" className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors">
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with count and filters */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold text-slate-800">
            {searchQuery ? (
              <>
                {totalSkills} {totalSkills === 1 ? 'skill' : 'skills'} found for "{searchQuery}"
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
            {/* Sort/Filter */}
            <select
              value={activeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="text-[13px] px-3 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all cursor-pointer"
            >
              {filters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="text-[13px] px-3 py-2 border border-slate-200 rounded-lg text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-300 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
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
            <Loader2 className="animate-spin text-slate-300" size={28} />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-[14px]">No skills found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-100 overflow-hidden">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 mt-2">
                <div className="text-[12px] text-slate-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalSkills)} of {totalSkills}
                </div>

                <div className="flex items-center gap-0.5">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-300 text-[13px]">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-all ${
                          currentPage === page
                            ? 'bg-slate-900 text-white'
                            : 'hover:bg-white text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-white text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
  );
};

export default Home;
