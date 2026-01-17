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

  // Author fields
  repo_id?: string;
  author_name?: string;
  author_url?: string;
  author_avatar_url?: string;
  author_slug?: string;
  instructions?: string;

  // Repo fields (joined)
  repo_stars?: number;
  repo_forks?: number;
  repo_license?: string;
  repo_owner?: string;
  repo_name?: string;
  repo_url?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  skill_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface SkillListResponse {
  success: boolean;
  data: Skill[];
  pagination: PaginationMeta;
}

export interface SkillResponse {
  success: boolean;
  data: Skill;
}

export interface CategoryListResponse {
  success: boolean;
  data: Category[];
}

export interface TagListResponse {
  success: boolean;
  data: Tag[];
  pagination?: PaginationMeta;
}

export interface CreateSkillRequest {
  slug: string;
  name: string;
  description: string;
  instructions: string;
  category_slug?: string;
  license?: string;
  compatibility?: string;
  allowed_tools?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  instructions: string;
  is_draft: boolean;
  is_latest: boolean;
  created_at: string;
  published_at?: string;
}

export interface SkillWithVersion extends Skill {
  latest_version?: SkillVersion;
}

export interface CreateSkillResponse {
  success: boolean;
  data: SkillWithVersion;
}

export interface ImportRequest {
  path: string;
}

export interface ImportResult {
  path: string;
  full_id: string;
  name: string;
}

export interface ImportRejection {
  path: string;
  reason: string;
}

export interface ImportResponse {
  success: boolean;
  imported: ImportResult[];
  rejected: ImportRejection[];
}

export interface SkillVersionResponse {
  success: boolean;
  data: SkillVersion;
}

export interface SkillVersionListResponse {
  success: boolean;
  data: SkillVersion[];
}

export interface UpdateDraftRequest {
  instructions: string;
  metadata?: Record<string, string>;
}

export interface PublishVersionRequest {
  version?: string;
  changelog?: string;
}

export interface SkillWithVersionResponse {
  success: boolean;
  data: SkillWithVersion;
}

// Repo interface
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

// Author interface
export interface Author {
  slug: string;
  name: string;
  url?: string;
  avatar_url?: string;
  skill_count: number;
}

// File tree interfaces
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  children?: FileNode[];
}

// Response types for new endpoints
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
