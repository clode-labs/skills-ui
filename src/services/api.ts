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
  // Skills endpoints
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<SkillListResponse>(`/skills${query}`)
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

  getSkill: (owner: string, repo: string, name: string) => {
    return fetchAPI<SkillWithVersionResponse>(
      `/skills/${owner}/${repo}/${name}`,
    )
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

  // Author endpoints
  getAuthors: (page = 1, limit = 20) => {
    return fetchAPI<AuthorListResponse>(`/authors?page=${page}&limit=${limit}`)
  },

  getAuthor: (slug: string) => {
    return fetchAPI<AuthorResponse>(`/authors/${slug}`)
  },

  getAuthorSkills: (slug: string, page = 1, limit = 20) => {
    return fetchAPI<SkillListResponse>(
      `/authors/${slug}/skills?page=${page}&limit=${limit}`,
    )
  },

  // Import endpoint (public) - may return sync or async response
  submitRepo: (url: string) => {
    return fetchAPI<ImportResponse | ImportJobResponse>('/import', {
      method: 'POST',
      body: JSON.stringify({ path: url }),
    })
  },

  // Get import job status
  getJobStatus: (jobId: string) => {
    return fetchAPI<ImportJobStatusResponse>(`/import/jobs/${jobId}`)
  },

  // Skill file endpoints
  getSkillTree: (skillId: string) => {
    return fetchAPI<FileTreeResponse>(`/skills/${skillId}/tree`)
  },

  getSkillFile: (skillId: string, path: string) => {
    return fetchAPI<FileContentResponse>(
      `/skills/${skillId}/file?path=${encodeURIComponent(path)}`,
    )
  },

  getSkillMarkdown: (skillId: string) => {
    return fetchAPI<SkillResponse>(`/skills/${skillId}/markdown`)
  },

  downloadSkillUrl: (skillId: string) => {
    return `${API_BASE_URL}/skills/${skillId}/download`
  },
}

// Authenticated API - requires JWT token (uses /api/v1 prefix)
export const authApi = {
  // Skills endpoints (returns public + user's private skills)
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<SkillListResponse>(`/api/v1/skills${query}`, {
      requiresAuth: true,
    })
  },

  searchSkills: (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    })
    return fetchAPI<SkillListResponse>(`/api/v1/skills/search?${params}`, {
      requiresAuth: true,
    })
  },

  getFeaturedSkills: () => {
    return fetchAPI<SkillListResponse>('/api/v1/skills/featured', {
      requiresAuth: true,
    })
  },

  getSkill: (owner: string, repo: string, name: string) => {
    return fetchAPI<SkillWithVersionResponse>(
      `/api/v1/skills/${owner}/${repo}/${name}`,
      { requiresAuth: true },
    )
  },

  // Private skills only
  getPrivateSkills: (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return fetchAPI<SkillListResponse>(`/api/v1/skills/private?${params}`, {
      requiresAuth: true,
    })
  },

  // Import with private option - may return sync or async response
  submitRepo: (url: string, isPrivate = false) => {
    return fetchAPI<ImportResponse | ImportJobResponse>('/api/v1/import', {
      method: 'POST',
      body: JSON.stringify({ path: url, is_private: isPrivate }),
      requiresAuth: true,
    })
  },

  // Get import job status (authenticated)
  getJobStatus: (jobId: string) => {
    return fetchAPI<ImportJobStatusResponse>(`/api/v1/import/jobs/${jobId}`, {
      requiresAuth: true,
    })
  },

  // Categories (includes private skill counts for user)
  getCategories: () => {
    return fetchAPI<CategoryListResponse>('/api/v1/categories', {
      requiresAuth: true,
    })
  },

  // Tags (includes private skill counts for user)
  getTags: (page = 1, limit = 100) => {
    return fetchAPI<TagListResponse>(
      `/api/v1/tags?page=${page}&limit=${limit}`,
      { requiresAuth: true },
    )
  },

  // User profile
  getProfile: () => {
    return fetchAPI<{ user: { id: string; email: string; name: string } }>(
      '/api/v1/me',
      { requiresAuth: true },
    )
  },
}
