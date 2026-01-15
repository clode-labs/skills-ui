import { useState } from 'react';
import { api } from '../services/api';
import type { ImportResponse } from '../types';
import { Loader2, CheckCircle, AlertCircle, Github, FileDown } from 'lucide-react';

const Import = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [path, setPath] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate required fields
      if (!path.trim()) {
        setError('Please enter a GitHub URL');
        setLoading(false);
        return;
      }

      // Validate URL format
      if (!path.startsWith('https://github.com/')) {
        setError('Please enter a valid GitHub URL (https://github.com/...)');
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await api.importSkills({ path: path.trim() });
      setResult(response);

    } catch (err: any) {
      console.error('Import error:', err);

      if (err.status === 401) {
        setError('Authentication failed. Please log in and try again.');
      } else if (err.status === 422 || err.status === 400) {
        setError(err.message || 'Invalid URL. Please check your input.');
      } else {
        setError('Failed to import skills. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Import Skills
        </h1>
        <p className="text-gray-600">
          Import skills from a GitHub repository
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Import Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="space-y-6">
          {/* GitHub URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository or Folder URL *
            </label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                required
                disabled={loading}
                placeholder="https://github.com/owner/repo or https://github.com/owner/repo/tree/main/skills"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Enter a GitHub repository URL or a specific folder containing skills.
              The system will discover all SKILL.md files in the path.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <FileDown size={20} />
                <span>Import Skills</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Success Summary */}
          {result.imported && result.imported.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-green-900">
                  Successfully Imported ({result.imported.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {result.imported.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-green-700">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-green-600 text-sm">({item.full_id})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rejected/Warnings */}
          {result.rejected && result.rejected.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-yellow-600" size={24} />
                <h3 className="text-lg font-semibold text-yellow-900">
                  Not Imported ({result.rejected.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {result.rejected.map((item, index) => (
                  <li key={index} className="text-yellow-700">
                    <span className="font-medium">{item.path}</span>
                    <span className="text-yellow-600 text-sm block">{item.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty Results */}
          {(!result.imported || result.imported.length === 0) &&
           (!result.rejected || result.rejected.length === 0) && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <p className="text-gray-600">No skills found in the specified path.</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Import Works</h3>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>The system scans the GitHub path for SKILL.md files</li>
          <li>Each SKILL.md file should contain skill metadata and instructions</li>
          <li>Skills are created under your account (owner ID from your token)</li>
          <li>Existing skills with the same slug will be skipped</li>
        </ul>
      </div>
    </div>
  );
};

export default Import;
