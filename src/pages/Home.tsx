import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import SkillCard from '../components/SkillCard'
import { api } from '../services/api'
import type { Skill, Category, SkillQueryParams } from '../types'

const Home = () => {
  const [searchParams] = useSearchParams()
  const [skills, setSkills] = useState<Skill[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('')

  const searchQuery = searchParams.get('search') || ''

  useEffect(() => {
    loadData()
  }, [searchQuery, activeFilter, selectedCategory])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load categories
      const categoriesResponse = await api.getCategories()
      setCategories(categoriesResponse.data)

      // Load skills based on filters
      let skillsResponse
      if (searchQuery) {
        skillsResponse = await api.searchSkills(searchQuery)
      } else if (activeFilter === 'featured') {
        skillsResponse = await api.getFeaturedSkills()
      } else {
        const params: SkillQueryParams = { limit: 50 }
        if (activeFilter !== 'all') {
          params.status = activeFilter
        }
        if (selectedCategory) {
          params.category = selectedCategory
        }
        skillsResponse = await api.getSkills(params)
      }

      setSkills(skillsResponse.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'approved', label: 'Latest' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Find Awesome <span className="text-red-600">Skills</span>
        </h1>
        <p className="text-lg text-gray-600">
          Aramb Skills is a searchable skills registry with{' '}
          <span className="font-semibold text-red-600">{skills.length}</span>{' '}
          skills collected.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id)
                setSelectedCategory('')
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={e => {
            setSelectedCategory(e.target.value)
            setActiveFilter('all')
          }}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-600" size={40} />
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No skills found</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {activeFilter === 'featured'
                ? 'Featured Skills'
                : searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory
                    ? `${categories.find(c => c.slug === selectedCategory)?.name || ''} Skills`
                    : 'All Skills'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map(skill => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Home
