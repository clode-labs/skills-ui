# API Route Restructure: Update API Paths

## Context

The skills-registry API routes are being restructured for consistent ingress routing:
- **Public routes**: Moving from `/` to `/api/v1/*`
- **Protected routes**: Moving from `/api/v1/*` to `/api/v1/me/*`

See full details in: `skills-registry/claude/tasks/api-route-restructure.md`

---

## Changes Required

### File: `src/services/api.ts`

#### 1. Update `api` object (public routes)

**Current → New mapping:**

```typescript
// Skills
`/skills`                    → `/api/v1/skills`
`/skills/search`             → `/api/v1/skills/search`
`/skills/featured`           → `/api/v1/skills/featured`
`/skills/${...}`             → `/api/v1/skills/${...}`
`/skills/${...}/tree`        → `/api/v1/skills/${...}/tree`
`/skills/${...}/file`        → `/api/v1/skills/${...}/file`
`/skills/${...}/markdown`    → `/api/v1/skills/${...}/markdown`
`/skills/${...}/download`    → `/api/v1/skills/${...}/download`

// Categories & Tags
`/categories`                → `/api/v1/categories`
`/tags`                      → `/api/v1/tags`

// Authors
`/authors`                   → `/api/v1/authors`
`/authors/${slug}`           → `/api/v1/authors/${slug}`
`/authors/${slug}/skills`    → `/api/v1/authors/${slug}/skills`

// Import
`/import`                    → `/api/v1/import`
`/import/jobs/${id}`         → `/api/v1/import/jobs/${id}`
```

#### 2. Update `authApi` object (protected routes)

**Current → New mapping:**

```typescript
// Skills
`/api/v1/skills`             → `/api/v1/me/skills`
`/api/v1/skills/search`      → `/api/v1/me/skills/search`
`/api/v1/skills/featured`    → `/api/v1/me/skills/featured`
`/api/v1/skills/private`     → `/api/v1/me/skills/private`
`/api/v1/skills/${...}`      → `/api/v1/me/skills/${...}`

// Import
`/api/v1/import`             → `/api/v1/me/import`
`/api/v1/import/jobs/${id}`  → `/api/v1/me/import/jobs/${id}`

// Categories & Tags
`/api/v1/categories`         → `/api/v1/me/categories`
`/api/v1/tags`               → `/api/v1/me/tags`

// Profile
`/api/v1/me`                 → `/api/v1/me/profile`
```

---

## Implementation

Replace all paths in `src/services/api.ts`:

```typescript
// Public API - no auth required
export const api = {
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return fetchAPI<SkillListResponse>(`/api/v1/skills${query}`)
  },

  searchSkills: (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    })
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
    return fetchAPI<AuthorListResponse>(`/api/v1/authors?page=${page}&limit=${limit}`)
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

  searchSkills: (query: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    })
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
    return fetchAPI<ImportJobStatusResponse>(`/api/v1/me/import/jobs/${jobId}`, {
      requiresAuth: true,
    })
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
}
```

---

## Verification

1. Ensure skills-registry changes are deployed first
2. Run `npm run dev` locally
3. Test public endpoints work without auth
4. Test authenticated endpoints work with login
5. Deploy to dev and verify against `https://api.clode.space/skills-registry/`
