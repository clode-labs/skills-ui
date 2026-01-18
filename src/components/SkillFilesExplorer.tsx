import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import type { FileNode } from '../types';

interface SkillFilesExplorerProps {
  skillId: string;
  skillName: string;
  skillDescription?: string;
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
        className={`flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded transition-colors ${
          isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
            <Folder className="w-4 h-4 text-amber-500" />
          </>
        ) : (
          <>
            <span className="w-3.5" />
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

export default function SkillFilesExplorer({ skillId, skillName, skillDescription }: SkillFilesExplorerProps) {
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
      // Get the relative path from the skill root
      // tree.path is the skill root (e.g., "skills/ansible")
      // node.path is the full path (e.g., "skills/ansible/SKILL.md")
      // We need to extract just "SKILL.md" (relative to skill root)
      let relativePath = node.path;

      if (tree) {
        const treePath = tree.path || '';
        const nodePath = node.path || '';

        // Strip the tree root path prefix if present
        if (treePath && nodePath.startsWith(treePath + '/')) {
          relativePath = nodePath.slice(treePath.length + 1);
        } else if (treePath && nodePath.startsWith(treePath)) {
          // Handle case where node.path equals tree.path (root directory selected)
          relativePath = nodePath.slice(treePath.length).replace(/^\//, '');
        } else if (treePath && nodePath.includes('/')) {
          // Fallback: if paths don't match but node has directory prefix,
          // try to extract just the filename portion after the tree's directory name
          const treeDir = treePath.split('/').pop() || '';
          const nodePathParts = nodePath.split('/');
          const treeDirIndex = nodePathParts.indexOf(treeDir);
          if (treeDirIndex >= 0) {
            relativePath = nodePathParts.slice(treeDirIndex + 1).join('/');
          }
        }
      }

      // Ensure we don't send empty path
      if (!relativePath && node.name) {
        relativePath = node.name;
      }

      const response = await api.getSkillFile(skillId, relativePath);
      setFileContent(response.content);
    } catch (error) {
      console.error('Failed to load file:', error);
      setFileContent('Failed to load file content');
    } finally {
      setContentLoading(false);
    }
  };

  const isMarkdown = selectedFile?.name.endsWith('.md');

  if (loading) {
    return <div className="p-4 text-gray-500">Loading files...</div>;
  }

  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* File Tree Sidebar */}
      <div className="w-52 flex-shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="py-2">
          {tree && (
            <TreeNode
              node={tree}
              onSelect={handleFileSelect}
              selectedPath={selectedFile?.path || null}
            />
          )}
        </div>
      </div>

      {/* Content Panel */}
      <div className="flex-1 overflow-y-auto bg-white" style={{ minHeight: '600px' }}>
        {contentLoading ? (
          <div className="p-8 text-gray-500">Loading...</div>
        ) : selectedFile ? (
          <div className="p-8">
            {/* Metadata Header for SKILL.md */}
            {selectedFile.name === 'SKILL.md' && (
              <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
                  SKILL METADATA
                </div>
                <div className="font-mono text-xs text-gray-400 mb-4">
                  {selectedFile.path}
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-sm text-gray-500 w-24">Name:</span>
                    <span className="text-sm font-semibold text-gray-900">{skillName}</span>
                  </div>
                  {skillDescription && (
                    <div className="flex">
                      <span className="text-sm text-gray-500 w-24 flex-shrink-0">Description:</span>
                      <span className="text-sm text-gray-700">{skillDescription}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Non-SKILL.md file path */}
            {selectedFile.name !== 'SKILL.md' && (
              <div className="font-mono text-xs text-gray-400 mb-6">{selectedFile.path}</div>
            )}

            {/* File Content */}
            {isMarkdown ? (
              <div className="skill-markdown">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-200">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-base font-semibold text-gray-800 mt-4 mb-2">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-base text-gray-700 leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside ml-6 mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside ml-6 mb-4 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-base text-gray-700 leading-relaxed">{children}</li>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                          {children}
                        </code>
                      );
                    },
                    pre: ({ children }) => (
                      <pre className="mb-4">{children}</pre>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                        {children}
                      </blockquote>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {fileContent}
                </ReactMarkdown>
              </div>
            ) : (
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                <code>{fileContent}</code>
              </pre>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a file to preview
          </div>
        )}
      </div>
    </div>
  );
}
