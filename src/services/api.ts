import type {
  SkillListResponse,
  SkillResponse,
  CategoryListResponse,
  TagListResponse,
  CreateSkillRequest,
  CreateSkillResponse,
  ImportRequest,
  ImportResponse,
  SkillVersionResponse,
  SkillVersionListResponse,
  UpdateDraftRequest,
  PublishVersionRequest,
  SkillWithVersionResponse,
} from '../types'
import { getAccessToken, getCurrentUserId } from './auth'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086'

// All endpoints require authentication
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw {
      status: response.status,
      message: error.error?.message || response.statusText,
      details: error,
    }
  }

  return response.json()
}

export const api = {
  // Skills endpoints
  getSkills: (params?: {
    page?: number
    limit?: number
    status?: string
    category?: string
  }) => {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', params.limit.toString())
    if (params?.status) query.set('status', params.status)
    if (params?.category) query.set('category', params.category)

    const queryString = query.toString()
    return fetchAPI<SkillListResponse>(
      `/skills${queryString ? `?${queryString}` : ''}`,
    )
  },

  // Get skills owned by the current user
  getMySkills: async (params?: { page?: number; limit?: number }) => {
    const userId = getCurrentUserId()
    const query = new URLSearchParams()
    if (params?.page) query.set('page', params.page.toString())
    if (params?.limit) query.set('limit', (params.limit || 50).toString())

    // Get all skills and filter by owner_id client-side
    // TODO: Add server-side owner filter endpoint
    const queryString = query.toString()
    const response = await fetchAPI<SkillListResponse>(
      `/skills${queryString ? `?${queryString}` : ''}`,
    )

    // Filter to only show skills owned by the current user
    const mySkills = response.data.filter(skill => skill.owner_id === userId)

    return {
      ...response,
      data: mySkills,
      pagination: {
        ...response.pagination,
        total_items: mySkills.length,
        total_pages: 1,
      },
    }
  },

  searchSkills: (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    })
    return fetchAPI<SkillListResponse>(`/skills/search?${params}`)
  },

  getFeaturedSkills: () => {
    return fetchAPI<SkillListResponse>('/skills/featured')
  },

  getSkill: (owner: string, slug: string) => {
    return fetchAPI<SkillWithVersionResponse>(`/skills/${owner}/${slug}`)
  },

  getSkillByFullId: (fullId: string) => {
    return fetchAPI<SkillWithVersionResponse>(`/skills/${fullId}`)
  },

  // Categories endpoints
  getCategories: () => {
    return fetchAPI<CategoryListResponse>('/categories')
  },

  // Tags endpoints
  getTags: (page = 1, limit = 100) => {
    return fetchAPI<TagListResponse>(`/tags?page=${page}&limit=${limit}`)
  },

  // Create skill endpoint
  createSkill: async (
    data: CreateSkillRequest,
  ): Promise<CreateSkillResponse> => {
    return fetchAPI<CreateSkillResponse>('/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Update skill metadata
  updateSkill: async (
    skillId: string,
    data: { name?: string; description?: string; tags?: string[] },
  ): Promise<SkillResponse> => {
    return fetchAPI<SkillResponse>(`/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Import skills endpoint
  importSkills: async (data: ImportRequest): Promise<ImportResponse> => {
    return fetchAPI<ImportResponse>('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Version endpoints
  getSkillVersions: (skillId: string) => {
    return fetchAPI<SkillVersionListResponse>(`/skills/${skillId}/versions`)
  },

  getSkillVersion: (skillId: string, version: string) => {
    return fetchAPI<SkillVersionResponse>(
      `/skills/${skillId}/versions/${version}`,
    )
  },

  getSkillDraft: (skillId: string) => {
    return fetchAPI<SkillVersionResponse>(`/skills/${skillId}/draft`)
  },

  updateSkillDraft: (skillId: string, data: UpdateDraftRequest) => {
    return fetchAPI<SkillVersionResponse>(`/skills/${skillId}/draft`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  publishSkillVersion: (skillId: string, data: PublishVersionRequest) => {
    return fetchAPI<SkillVersionResponse>(`/skills/${skillId}/publish`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
