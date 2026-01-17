import type {
  SkillListResponse,
  SkillResponse,
  CategoryListResponse,
  TagListResponse,
  ImportResponse,
  SkillWithVersionResponse,
  AuthorResponse,
  AuthorListResponse,
  FileTreeResponse,
  FileContentResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

// Public API - no auth required
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Skills endpoints
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI<SkillListResponse>(`/skills${query}`);
  },

  searchSkills: (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({ q: query, page: page.toString(), limit: limit.toString() });
    return fetchAPI<SkillListResponse>(`/skills/search?${params}`);
  },

  getFeaturedSkills: () => {
    return fetchAPI<SkillListResponse>('/skills/featured');
  },

  getSkill: (owner: string, repo: string, name: string) => {
    return fetchAPI<SkillWithVersionResponse>(`/skills/${owner}/${repo}/${name}`);
  },

  getSkillByFullId: (fullId: string) => {
    return fetchAPI<SkillWithVersionResponse>(`/skills/${fullId}`);
  },

  // Categories endpoints
  getCategories: () => {
    return fetchAPI<CategoryListResponse>('/categories');
  },

  // Tags endpoints
  getTags: (page = 1, limit = 100) => {
    return fetchAPI<TagListResponse>(`/tags?page=${page}&limit=${limit}`);
  },

  // Author endpoints
  getAuthors: (page = 1, limit = 20) => {
    return fetchAPI<AuthorListResponse>(`/authors?page=${page}&limit=${limit}`);
  },

  getAuthor: (slug: string) => {
    return fetchAPI<AuthorResponse>(`/authors/${slug}`);
  },

  getAuthorSkills: (slug: string, page = 1, limit = 20) => {
    return fetchAPI<SkillListResponse>(`/authors/${slug}/skills?page=${page}&limit=${limit}`);
  },

  // Import endpoint (public)
  submitRepo: (url: string) => {
    return fetchAPI<ImportResponse>('/import', {
      method: 'POST',
      body: JSON.stringify({ path: url }),
    });
  },

  // Skill file endpoints
  getSkillTree: (skillId: string) => {
    return fetchAPI<FileTreeResponse>(`/skills/${skillId}/tree`);
  },

  getSkillFile: (skillId: string, path: string) => {
    return fetchAPI<FileContentResponse>(`/skills/${skillId}/file?path=${encodeURIComponent(path)}`);
  },

  getSkillMarkdown: (skillId: string) => {
    return fetchAPI<SkillResponse>(`/skills/${skillId}/markdown`);
  },

  downloadSkillUrl: (skillId: string) => {
    return `${API_BASE_URL}/skills/${skillId}/download`;
  },
};
