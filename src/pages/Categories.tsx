import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, FolderOpen, ChevronRight } from 'lucide-react'

import { api } from '../services/api'
import type { Category } from '../types'

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await api.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

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
              className="px-4 py-3 text-[13px] font-medium text-slate-500 hover:text-slate-800 border-b-2 border-transparent hover:border-slate-300 -mb-px transition-colors"
            >
              Authors
            </Link>
            <Link
              to="/categories"
              className="px-4 py-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 -mb-px"
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
            {categories.length} categories
          </h2>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={28} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-[14px]">No categories found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm shadow-slate-100 overflow-hidden">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/skills?category=${encodeURIComponent(category.name)}`}
                className={`block px-5 py-4 hover:bg-slate-50 transition-colors group ${
                  index !== categories.length - 1
                    ? 'border-b border-slate-100'
                    : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                    <FolderOpen size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[15px] text-slate-900 group-hover:text-violet-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-[13px] text-slate-500">
                      <span>
                        {category.skill_count || 0} skill
                        {category.skill_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* View link */}
                  <div className="flex items-center gap-1 text-[13px] text-violet-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View skills
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
