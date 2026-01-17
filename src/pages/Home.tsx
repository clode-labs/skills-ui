import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SkillCard from '../components/SkillCard';
import { api } from '../services/api';
import type { Skill, Category, PaginationMeta } from '../types';
import { Loader2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
    <div className="bg-white min-h-screen">
      {/* Navigation Tabs - npm style */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-6">
            <Link to="/skills" className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black">
              Skills
            </Link>
            <Link to="/authors" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300">
              Authors
            </Link>
            <Link to="/categories" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300">
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header with count and filters */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
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

          <div className="flex items-center gap-3">
            {/* Sort/Filter */}
            <select
              value={activeFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
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
              className="text-sm px-3 py-1.5 border border-gray-300 rounded text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <Link
              to="/import"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Submit Skill
            </Link>
          </div>
        </div>

        {/* Skills List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : skills.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No skills found</p>
          </div>
        ) : (
          <>
            <div className="border-t border-gray-200">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-6">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalSkills)} of {totalSkills} skills
                </div>

                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === page
                            ? 'bg-black text-white'
                            : 'hover:bg-gray-100 text-gray-700'
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
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
  );
};

export default Home;
