import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, FolderOpen } from 'lucide-react'

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
              className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Authors
            </Link>
            <Link
              to="/categories"
              className="py-3 px-1 text-sm font-medium text-gray-900 border-b-2 border-black"
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
            {categories.length} categories
          </h2>
        </div>

        {/* Categories List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/skills?category=${encodeURIComponent(category.name)}`}
                className="block border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    <FolderOpen size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-blue-600 hover:underline">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {category.skill_count || 0} skill
                        {category.skill_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* View link */}
                  <span className="text-sm text-blue-600 font-medium">
                    View skills
                  </span>
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
