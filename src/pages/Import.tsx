import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { ImportResponse } from '../types';
import { Loader2, CheckCircle, AlertCircle, Github, FileDown, Lock } from 'lucide-react';

export default function Import() {
  const { isAuthenticated } = useAuth();
  const [url, setUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Use authenticated endpoint if logged in, otherwise public endpoint
      const response = isAuthenticated
        ? await authApi.submitRepo(url, isPrivate)
        : await api.submitRepo(url);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-6">
            <Link to="/skills" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300">
              Skills
            </Link>
            <Link to="/authors" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300">
              Authors
            </Link>
            <Link to="/categories" className="py-3 px-1 text-sm font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300">
              Categories
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Submit a Skill</h1>
        <p className="text-gray-600 mb-6">
          Enter a GitHub repository URL to import skills. The repository should contain
          a <code className="bg-gray-100 px-1 rounded">skills/</code> folder with skill
          subfolders containing <code className="bg-gray-100 px-1 rounded">SKILL.md</code> files.
        </p>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo or owner/repo"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Importing...
                </>
              ) : (
                <>
                  <FileDown size={20} />
                  Import
                </>
              )}
            </button>
          </div>

          {/* Visibility option - only shown when authenticated */}
          {isAuthenticated && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Skill visibility:</p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="mt-0.5 w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Public</span>
                    <p className="text-xs text-gray-500">Visible to everyone in the skills registry</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="mt-0.5 w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">Private</span>
                    <Lock size={14} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 -mt-5 ml-6">Only visible to you in "My Skills"</p>
                </label>
              </div>
            </div>
          )}
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
            <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
            <div>{error}</div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {result.imported?.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-800">
                    Successfully imported {result.imported.length} skill(s)
                  </h3>
                </div>
                <ul className="list-disc list-inside text-green-700">
                  {result.imported.map((item) => (
                    <li key={item.full_id}>{item.full_id}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.rejected?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-yellow-600" size={20} />
                  <h3 className="font-semibold text-yellow-800">
                    {result.rejected.length} item(s) could not be imported
                  </h3>
                </div>
                <ul className="list-disc list-inside text-yellow-700">
                  {result.rejected.map((item, i) => (
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
    </div>
  );
}
