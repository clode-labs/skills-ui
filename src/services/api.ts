import type {
  SkillListResponse,
  SkillResponse,
  CategoryListResponse,
  TagListResponse,
  ImportResponse,
  ImportJobResponse,
  ImportJobStatusResponse,
  SkillWithVersionResponse,
  AuthorResponse,
  AuthorListResponse,
  FileTreeResponse,
  FileContentResponse,
} from '../types'
import { getAccessToken } from './auth'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086'

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean
}

// Fetch wrapper with optional auth support
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const {
    requiresAuth = false,
    headers: customHeaders,
    ...fetchOptions
  } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  }

  // Add auth header if required or if token is available
  if (requiresAuth) {
    const token = getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  return response.json()
}

// Public API - no auth required
export const api = {
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<SkillListResponse>(`/api/v1/skills${query}`)
  },

  searchSkills: (options: {
    q?: string
    category?: string
    tag?: string
    author?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (options.q) params.set('q', options.q)
    if (options.category) params.set('category', options.category)
    if (options.tag) params.set('tag', options.tag)
    if (options.author) params.set('author', options.author)
    params.set('page', (options.page || 1).toString())
    params.set('limit', (options.limit || 20).toString())
    return fetchAPI<SkillListResponse>(`/api/v1/skills/search?${params}`)
  },

  getFeaturedSkills: () => {
    return fetchAPI<SkillListResponse>('/api/v1/skills/featured')
  },

  getSkill: (owner: string, repo: string, name: string) => {
    return fetchAPI<SkillWithVersionResponse>(
      `/api/v1/skills/${owner}/${repo}/${name}`,
    )
  },

  getSkillByFullId: (fullId: string) => {
    return fetchAPI<SkillWithVersionResponse>(`/api/v1/skills/${fullId}`)
  },

  getCategories: () => {
    return fetchAPI<CategoryListResponse>('/api/v1/categories')
  },

  getTags: (page = 1, limit = 100) => {
    return fetchAPI<TagListResponse>(`/api/v1/tags?page=${page}&limit=${limit}`)
  },

  getAuthors: (page = 1, limit = 20) => {
    return fetchAPI<AuthorListResponse>(
      `/api/v1/authors?page=${page}&limit=${limit}`,
    )
  },

  getAuthor: (slug: string) => {
    return fetchAPI<AuthorResponse>(`/api/v1/authors/${slug}`)
  },

  getAuthorSkills: (slug: string, page = 1, limit = 20) => {
    return fetchAPI<SkillListResponse>(
      `/api/v1/authors/${slug}/skills?page=${page}&limit=${limit}`,
    )
  },

  submitRepo: (url: string) => {
    return fetchAPI<ImportResponse | ImportJobResponse>('/api/v1/import', {
      method: 'POST',
      body: JSON.stringify({ path: url }),
    })
  },

  getJobStatus: (jobId: string) => {
    return fetchAPI<ImportJobStatusResponse>(`/api/v1/import/jobs/${jobId}`)
  },

  getSkillTree: (skillId: string) => {
    return fetchAPI<FileTreeResponse>(`/api/v1/skills/${skillId}/tree`)
  },

  getSkillFile: (skillId: string, path: string) => {
    return fetchAPI<FileContentResponse>(
      `/api/v1/skills/${skillId}/file?path=${encodeURIComponent(path)}`,
    )
  },

  getSkillMarkdown: (skillId: string) => {
    return fetchAPI<SkillResponse>(`/api/v1/skills/${skillId}/markdown`)
  },

  downloadSkillUrl: (skillId: string) => {
    return `${API_BASE_URL}/api/v1/skills/${skillId}/download`
  },
}

// Authenticated API - requires JWT token (uses /api/v1/me prefix)
export const authApi = {
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<SkillListResponse>(`/api/v1/me/skills${query}`, {
      requiresAuth: true,
    })
  },

  searchSkills: (options: {
    q?: string
    category?: string
    tag?: string
    author?: string
    page?: number
    limit?: number
  }) => {
    const params = new URLSearchParams()
    if (options.q) params.set('q', options.q)
    if (options.category) params.set('category', options.category)
    if (options.tag) params.set('tag', options.tag)
    if (options.author) params.set('author', options.author)
    params.set('page', (options.page || 1).toString())
    params.set('limit', (options.limit || 20).toString())
    return fetchAPI<SkillListResponse>(`/api/v1/me/skills/search?${params}`, {
      requiresAuth: true,
    })
  },

  getFeaturedSkills: () => {
    return fetchAPI<SkillListResponse>('/api/v1/me/skills/featured', {
      requiresAuth: true,
    })
  },

  getSkill: (owner: string, repo: string, name: string) => {
    return fetchAPI<SkillWithVersionResponse>(
      `/api/v1/me/skills/${owner}/${repo}/${name}`,
      { requiresAuth: true },
    )
  },

  getPrivateSkills: (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return fetchAPI<SkillListResponse>(`/api/v1/me/skills/private?${params}`, {
      requiresAuth: true,
    })
  },

  submitRepo: (url: string, isPrivate = false) => {
    return fetchAPI<ImportResponse | ImportJobResponse>('/api/v1/me/import', {
      method: 'POST',
      body: JSON.stringify({ path: url, is_private: isPrivate }),
      requiresAuth: true,
    })
  },

  getJobStatus: (jobId: string) => {
    return fetchAPI<ImportJobStatusResponse>(
      `/api/v1/me/import/jobs/${jobId}`,
      {
        requiresAuth: true,
      },
    )
  },

  getCategories: () => {
    return fetchAPI<CategoryListResponse>('/api/v1/me/categories', {
      requiresAuth: true,
    })
  },

  getTags: (page = 1, limit = 100) => {
    return fetchAPI<TagListResponse>(
      `/api/v1/me/tags?page=${page}&limit=${limit}`,
      { requiresAuth: true },
    )
  },

  getProfile: () => {
    return fetchAPI<{ user: { id: string; email: string; name: string } }>(
      '/api/v1/me/profile',
      { requiresAuth: true },
    )
  },

  getSkillTree: (skillId: string) => {
    // Use public endpoint with auth header (no /me/ version exists)
    return fetchAPI<FileTreeResponse>(`/api/v1/skills/${skillId}/tree`, {
      requiresAuth: true,
    })
  },

  getSkillFile: (skillId: string, path: string) => {
    // Use public endpoint with auth header (no /me/ version exists)
    return fetchAPI<FileContentResponse>(
      `/api/v1/skills/${skillId}/file?path=${encodeURIComponent(path)}`,
      { requiresAuth: true },
    )
  },

  downloadSkillUrl: (skillId: string) => {
    // Note: download URL can't include auth header, user needs to be authenticated via cookie or other mechanism
    return `${API_BASE_URL}/api/v1/skills/${skillId}/download`
  },
}
