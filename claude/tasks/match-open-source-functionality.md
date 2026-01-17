# Frontend Implementation: Match Open Source Agent-Skills Functionality

## Overview
Refactor skills-ui React frontend to match open source agent-skills functionality with authors, file explorer, and simplified navigation.

## Current State
- 65-70% complete React frontend with all pages
- Has Submit, MySkills, SkillEditor pages (to be removed)
- Auth integration with JWT (to be removed for public access)
- SkillCard and SkillDetail need author/repo info

## Target State
1. Remove manual submission pages
2. Add Authors listing and detail pages
3. Update SkillCard with author/stars/forks
4. Redesign SkillDetail with file explorer and install command
5. Remove auth from API calls (public access)

---

## Phase 1: Remove Unnecessary Pages

### 1.1 Delete Files

Delete these files:
- `src/pages/Submit.tsx`
- `src/pages/SkillEditor.tsx`
- `src/pages/MySkills.tsx`

### 1.2 Update App.tsx Routes

**File:** `src/App.tsx`

Remove routes:
```tsx
// Remove these:
// <Route path="/submit" element={<Submit />} />
// <Route path="/my-skills" element={<MySkills />} />
// <Route path="/my-skills/:owner/:slug/edit" element={<SkillEditor />} />

// Add these:
<Route path="/authors" element={<Authors />} />
<Route path="/authors/:slug" element={<AuthorDetail />} />
```

Remove imports for deleted pages, add imports for new pages.

### 1.3 Update Sidebar Navigation

**File:** `src/components/Sidebar.tsx`

```tsx
const menuItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Box, label: 'Skills', path: '/skills' },
  { icon: Users, label: 'Authors', path: '/authors' },    // NEW
  { icon: FolderOpen, label: 'Categories', path: '/categories' },
  { icon: Tag, label: 'Tags', path: '/tags' },
  { icon: Download, label: 'Import', path: '/import' },
  // Remove: Submit, My Skills
];
```

### 1.4 Update Header

**File:** `src/components/Header.tsx`

Remove the "Submit Skill" button. Keep only the search bar.

---

## Phase 2: Update Types

### 2.1 Update Types File

**File:** `src/types/index.ts`

```typescript
export interface Skill {
  id: string;
  owner_id: string;
  slug: string;
  full_id: string;
  name: string;
  description: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  source_type: string;
  source_url?: string;
  category_id?: string;
  category_slug?: string;
  category_name?: string;
  status: 'draft' | 'pending' | 'approved' | 'featured' | 'archived';
  download_count: number;
  star_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags?: string[];

  // NEW: Author fields
  repo_id?: string;
  author_name?: string;
  author_url?: string;
  author_avatar_url?: string;
  author_slug?: string;
  instructions?: string;

  // NEW: Repo fields (joined)
  repo_stars?: number;
  repo_forks?: number;
  repo_license?: string;
  repo_owner?: string;
  repo_name?: string;
  repo_url?: string;
}

// NEW: Repo interface
export interface Repo {
  id: string;
  owner: string;
  name: string;
  url?: string;
  license?: string;
  stars: number;
  forks: number;
  owner_name?: string;
  owner_url?: string;
  owner_avatar_url?: string;
  skills_path?: string;
  last_parsed_at?: string;
  created_at: string;
  updated_at: string;
}

// NEW: Author interface
export interface Author {
  slug: string;
  name: string;
  url?: string;
  avatar_url?: string;
  skill_count: number;
}

// NEW: File tree interfaces
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: FileNode[];
}

// Response types
export interface AuthorResponse {
  success: boolean;
  data: Author;
}

export interface AuthorListResponse {
  success: boolean;
  data: Author[];
  pagination: PaginationMeta;
}

export interface FileTreeResponse {
  success: boolean;
  data: FileNode;
}

export interface FileContentResponse {
  success: boolean;
  path: string;
  content: string;
  is_binary: boolean;
}
```

---

## Phase 3: Update API Service

### 3.1 Remove Auth, Add New Endpoints

**File:** `src/services/api.ts`

```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8086';

// Remove auth header from all requests
const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Existing endpoints (keep these)
  getSkills: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchAPI(`/skills${query}`);
  },

  searchSkills: (query: string, page = 1, limit = 20) =>
    fetchAPI(`/skills/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),

  getFeaturedSkills: () => fetchAPI('/skills/featured'),

  getSkill: (owner: string, slug: string) =>
    fetchAPI(`/skills/${owner}/${slug}`),

  getCategories: () => fetchAPI('/categories'),

  getTags: (page = 1, limit = 100) =>
    fetchAPI(`/tags?page=${page}&limit=${limit}`),

  // NEW: Author endpoints
  getAuthors: (page = 1, limit = 20) =>
    fetchAPI(`/authors?page=${page}&limit=${limit}`),

  getAuthor: (slug: string) =>
    fetchAPI(`/authors/${slug}`),

  getAuthorSkills: (slug: string, page = 1, limit = 20) =>
    fetchAPI(`/authors/${slug}/skills?page=${page}&limit=${limit}`),

  // NEW: Repo endpoints
  getRepos: (page = 1, limit = 20) =>
    fetchAPI(`/repos?page=${page}&limit=${limit}`),

  submitRepo: (url: string) =>
    fetchAPI('/import', {
      method: 'POST',
      body: JSON.stringify({ path: url }),
    }),

  // NEW: Skill file endpoints
  getSkillTree: (skillId: string) =>
    fetchAPI(`/skills/${skillId}/tree`),

  getSkillFile: (skillId: string, path: string) =>
    fetchAPI(`/skills/${skillId}/file?path=${encodeURIComponent(path)}`),

  getSkillMarkdown: (skillId: string) =>
    fetchAPI(`/skills/${skillId}/markdown`),

  downloadSkillUrl: (skillId: string) =>
    `${API_BASE}/skills/${skillId}/download`,
};
```

### 3.2 Remove Auth Service

Delete or simplify `src/services/auth.ts` - no longer needed for public access.

---

## Phase 4: Create Authors Pages

### 4.1 Authors List Page

**File:** `src/pages/Authors.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Author, PaginationMeta } from '../types';

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true);
      try {
        const response = await api.getAuthors(page, 24);
        setAuthors(response.data);
        setPagination(response.pagination);
      } catch (error) {
        console.error('Failed to fetch authors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, [page]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Authors</h1>
      <p className="text-gray-600 mb-8">
        Browse skills by author. {pagination?.total || 0} authors have contributed skills.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {authors.map((author) => (
          <Link
            key={author.slug}
            to={`/authors/${author.slug}`}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                  {author.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{author.name || author.slug}</h3>
                <p className="text-sm text-gray-500">
                  {author.skill_count} skill{author.skill_count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4.2 Author Detail Page

**File:** `src/pages/AuthorDetail.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Author, Skill, PaginationMeta } from '../types';
import SkillCard from '../components/SkillCard';

export default function AuthorDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const [authorRes, skillsRes] = await Promise.all([
          api.getAuthor(slug),
          api.getAuthorSkills(slug, page, 20),
        ]);
        setAuthor(authorRes.data);
        setSkills(skillsRes.data);
        setPagination(skillsRes.pagination);
      } catch (error) {
        console.error('Failed to fetch author:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [slug, page]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!author) {
    return <div className="p-6">Author not found</div>;
  }

  return (
    <div className="p-6">
      {/* Author Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
              {author.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{author.name || author.slug}</h1>
            {author.url && (
              <a
                href={author.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
              >
                {author.url}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <p className="text-gray-500 mt-2">
              {author.skill_count} skill{author.skill_count !== 1 ? 's' : ''} published
            </p>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <h2 className="text-xl font-semibold mb-4">Skills by {author.name || author.slug}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 5: Create New Components

### 5.1 CodeBlockCommand Component

**File:** `src/components/CodeBlockCommand.tsx`

```tsx
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockCommandProps {
  repoUrl: string;
  skillPath: string;
}

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export default function CodeBlockCommand({ repoUrl, skillPath }: CodeBlockCommandProps) {
  const [selected, setSelected] = useState<PackageManager>('pnpm');
  const [copied, setCopied] = useState(false);

  const getCommand = (pm: PackageManager) => {
    const skillUrl = `${repoUrl}/tree/main/${skillPath}`;
    switch (pm) {
      case 'pnpm':
        return `pnpm dlx add-skill ${skillUrl}`;
      case 'npm':
        return `npx add-skill ${skillUrl}`;
      case 'yarn':
        return `yarn dlx add-skill ${skillUrl}`;
      case 'bun':
        return `bunx add-skill ${skillUrl}`;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCommand(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const managers: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {managers.map((pm) => (
          <button
            key={pm}
            onClick={() => setSelected(pm)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selected === pm
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {pm}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="flex items-center justify-between p-4">
        <code className="text-green-400 text-sm font-mono flex-1 overflow-x-auto">
          {getCommand(selected)}
        </code>
        <button
          onClick={handleCopy}
          className="ml-4 p-2 text-gray-400 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
```

### 5.2 SkillFilesExplorer Component

**File:** `src/components/SkillFilesExplorer.tsx`

```tsx
import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { FileNode } from '../types';

interface SkillFilesExplorerProps {
  skillId: string;
  skillName: string;
}

interface TreeNodeProps {
  node: FileNode;
  onSelect: (node: FileNode) => void;
  selectedPath: string | null;
  depth?: number;
}

function TreeNode({ node, onSelect, selectedPath, depth = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = selectedPath === node.path;
  const isDir = node.type === 'dir';

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onSelect(node);
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
          isSelected ? 'bg-blue-50 text-blue-700' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Folder className="w-4 h-4 text-yellow-500" />
          </>
        ) : (
          <>
            <span className="w-4" />
            <File className="w-4 h-4 text-gray-400" />
          </>
        )}
        <span className="text-sm truncate">{node.name}</span>
      </div>

      {isDir && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              onSelect={onSelect}
              selectedPath={selectedPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SkillFilesExplorer({ skillId, skillName }: SkillFilesExplorerProps) {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await api.getSkillTree(skillId);
        setTree(response.data);

        // Auto-select SKILL.md if present
        const skillMd = findFile(response.data, 'SKILL.md');
        if (skillMd) {
          handleFileSelect(skillMd);
        }
      } catch (error) {
        console.error('Failed to fetch file tree:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, [skillId]);

  const findFile = (node: FileNode, name: string): FileNode | null => {
    if (node.name === name && node.type === 'file') return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findFile(child, name);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFileSelect = async (node: FileNode) => {
    setSelectedFile(node);
    setContentLoading(true);
    try {
      const response = await api.getSkillFile(skillId, node.path);
      setFileContent(response.content);
    } catch (error) {
      setFileContent('Failed to load file content');
    } finally {
      setContentLoading(false);
    }
  };

  const isMarkdown = selectedFile?.name.endsWith('.md');

  if (loading) {
    return <div className="p-4">Loading files...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b">
        <div>
          <h3 className="font-medium">Skill Files</h3>
          <p className="text-sm text-gray-500">
            Browse the full folder contents for {skillName}
          </p>
        </div>
        <a
          href={api.downloadSkillUrl(skillId)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Skill
        </a>
      </div>

      {/* Explorer */}
      <div className="flex" style={{ height: '500px' }}>
        {/* File Tree */}
        <div className="w-64 border-r overflow-y-auto bg-gray-50">
          {tree && (
            <TreeNode
              node={tree}
              onSelect={handleFileSelect}
              selectedPath={selectedFile?.path || null}
            />
          )}
        </div>

        {/* Preview Panel */}
        <div className="flex-1 overflow-y-auto p-4">
          {contentLoading ? (
            <div>Loading...</div>
          ) : selectedFile ? (
            <div>
              <div className="text-sm text-gray-500 mb-2">{selectedFile.path}</div>
              {isMarkdown ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{fileContent}</ReactMarkdown>
                </div>
              ) : (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{fileContent}</code>
                </pre>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-20">
              Select a file to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 6: Update SkillCard Component

**File:** `src/components/SkillCard.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Star, GitFork } from 'lucide-react';
import { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  // Build link path
  const linkPath = skill.full_id
    ? `/skills/${skill.full_id}`
    : `/skills/${skill.owner_id}/${skill.slug}`;

  return (
    <Link
      to={linkPath}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 truncate">{skill.name}</h3>

      {/* Description - max 4 lines */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-4">{skill.description}</p>

      {/* Tags - max 4 */}
      {skill.tags && skill.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {skill.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {skill.tags.length > 4 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">
              +{skill.tags.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 my-3" />

      {/* Footer: Author | Stars & Forks */}
      <div className="flex items-center justify-between">
        {/* Author */}
        <div className="flex items-center gap-2">
          {skill.author_avatar_url ? (
            <img
              src={skill.author_avatar_url}
              alt={skill.author_name || 'Author'}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
              {(skill.author_name || skill.repo_owner || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm text-gray-600 truncate max-w-[120px]">
            {skill.author_name || skill.repo_owner || 'Unknown'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          {(skill.repo_stars !== undefined && skill.repo_stars > 0) && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{formatNumber(skill.repo_stars)}</span>
            </div>
          )}
          {(skill.repo_forks !== undefined && skill.repo_forks > 0) && (
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              <span>{formatNumber(skill.repo_forks)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}
```

---

## Phase 7: Redesign SkillDetail Page

**File:** `src/pages/SkillDetail.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, GitFork, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { Skill } from '../types';
import CodeBlockCommand from '../components/CodeBlockCommand';
import SkillFilesExplorer from '../components/SkillFilesExplorer';

export default function SkillDetail() {
  const { owner, slug } = useParams<{ owner: string; slug: string }>();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkill = async () => {
      if (!owner || !slug) return;
      setLoading(true);
      try {
        const response = await api.getSkill(owner, slug);
        setSkill(response.data);
      } catch (error) {
        console.error('Failed to fetch skill:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [owner, slug]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!skill) {
    return <div className="p-6">Skill not found</div>;
  }

  const repoUrl = skill.repo_url || `https://github.com/${skill.repo_owner}/${skill.repo_name}`;
  const skillPath = skill.source_url?.split('/tree/main/')?.[1] || `skills/${skill.slug}`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Left Column (60%) */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-bold mb-2">Agent Skills: {skill.name}</h1>
          <p className="text-gray-600 mb-4">{skill.description}</p>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta badges */}
          <div className="flex flex-wrap gap-2">
            {skill.category_name && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                {skill.category_name}
              </span>
            )}
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-mono">
              ID: {skill.full_id}
            </span>
          </div>
        </div>

        {/* Right Column (40%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Author Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Author</h4>
            <div className="flex items-center gap-3">
              {skill.author_avatar_url ? (
                <img
                  src={skill.author_avatar_url}
                  alt={skill.author_name || 'Author'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {(skill.author_name || '?').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium">{skill.author_name || skill.repo_owner}</p>
                {skill.author_url && (
                  <a
                    href={skill.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {skill.author_url}
                  </a>
                )}
              </div>
            </div>
            {skill.author_slug && (
              <Link
                to={`/authors/${skill.author_slug}`}
                className="block mt-3 text-sm text-blue-600 hover:underline"
              >
                View all skills by this author
              </Link>
            )}
          </div>

          {/* Repository Card */}
          {skill.repo_owner && skill.repo_name && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Repository</h4>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline mb-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                {skill.repo_owner}/{skill.repo_name}
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded">{skill.repo_owner}</span>
                {skill.repo_license && (
                  <span className="px-2 py-1 bg-gray-100 rounded">{skill.repo_license}</span>
                )}
                {skill.repo_stars !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {skill.repo_stars.toLocaleString()}
                  </div>
                )}
                {skill.repo_forks !== undefined && (
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {skill.repo_forks.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Install Command Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Install this agent skill to your local</h2>
        <CodeBlockCommand repoUrl={repoUrl} skillPath={skillPath} />
      </div>

      {/* Skill Files Explorer */}
      <SkillFilesExplorer skillId={skill.id} skillName={skill.name} />
    </div>
  );
}
```

---

## Phase 8: Update Import Page

**File:** `src/pages/Import.tsx`

Update to work without auth:

```tsx
import { useState } from 'react';
import { api } from '../services/api';

export default function Import() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await api.submitRepo(url);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Import Skills from GitHub</h1>
      <p className="text-gray-600 mb-6">
        Enter a GitHub repository URL to import skills. The repository should contain
        a <code className="bg-gray-100 px-1 rounded">skills/</code> folder with skill
        subfolders containing <code className="bg-gray-100 px-1 rounded">SKILL.md</code> files.
      </p>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo or owner/repo"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {result.imported?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">
                Successfully imported {result.imported.length} skill(s)
              </h3>
              <ul className="list-disc list-inside text-green-700">
                {result.imported.map((item: any) => (
                  <li key={item.full_id}>{item.full_id}</li>
                ))}
              </ul>
            </div>
          )}

          {result.rejected?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                {result.rejected.length} item(s) could not be imported
              </h3>
              <ul className="list-disc list-inside text-yellow-700">
                {result.rejected.map((item: any, i: number) => (
                  <li key={i}>{item.path}: {item.reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Supported URL formats:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li><code>owner/repo</code></li>
          <li><code>owner/repo/custom-skills-path</code></li>
          <li><code>https://github.com/owner/repo</code></li>
          <li><code>https://github.com/owner/repo/tree/main/skills</code></li>
        </ul>
      </div>
    </div>
  );
}
```

---

## Implementation Order

1. **Types** - Update `src/types/index.ts`
2. **API Service** - Update `src/services/api.ts`, remove auth
3. **Delete Pages** - Remove Submit.tsx, SkillEditor.tsx, MySkills.tsx
4. **Routes** - Update `src/App.tsx`
5. **Navigation** - Update Sidebar.tsx, Header.tsx
6. **Authors Pages** - Create Authors.tsx, AuthorDetail.tsx
7. **Components** - Create CodeBlockCommand.tsx, SkillFilesExplorer.tsx
8. **SkillCard** - Update with author/stars/forks
9. **SkillDetail** - Complete redesign
10. **Import** - Update Import.tsx for public access
11. **Test** - Verify all flows work

---

## Dependencies to Add

```bash
npm install react-markdown
# or
pnpm add react-markdown
```

---

## Testing Checklist

- [ ] Home page loads skills with author info
- [ ] Click skill card -> detail page shows author section
- [ ] Detail page shows install command with package manager tabs
- [ ] Detail page file explorer loads and previews files
- [ ] Navigate to /authors -> see list of authors
- [ ] Click author -> see their skills
- [ ] Import page works without auth
- [ ] Import a GitHub repo successfully
- [ ] Sidebar shows correct navigation (no Submit/My Skills)
- [ ] Header has no Submit button
- [ ] Search works

---

## Files Summary

### New Files
- `src/pages/Authors.tsx`
- `src/pages/AuthorDetail.tsx`
- `src/components/CodeBlockCommand.tsx`
- `src/components/SkillFilesExplorer.tsx`

### Delete Files
- `src/pages/Submit.tsx`
- `src/pages/SkillEditor.tsx`
- `src/pages/MySkills.tsx`
- `src/services/auth.ts` (optional, can simplify)

### Modified Files
- `src/App.tsx`
- `src/types/index.ts`
- `src/services/api.ts`
- `src/components/Sidebar.tsx`
- `src/components/Header.tsx`
- `src/components/SkillCard.tsx`
- `src/pages/SkillDetail.tsx`
- `src/pages/Import.tsx`
