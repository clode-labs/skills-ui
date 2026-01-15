import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Category, CreateSkillRequest } from '../types';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const Submit = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    description: '',
    license: '',
    compatibility: '',
    categorySlug: '',
    tags: '',
    instructions: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.slug || !formData.name ||
          !formData.description || !formData.instructions) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate slug is lowercase
      if (formData.slug !== formData.slug.toLowerCase()) {
        setError('Skill slug must be lowercase');
        setLoading(false);
        return;
      }

      // Validate description length
      if (formData.description.length > 1024) {
        setError('Description must be 1024 characters or less');
        setLoading(false);
        return;
      }

      // Transform data for API (owner_id comes from JWT token)
      const payload: CreateSkillRequest = {
        slug: formData.slug.trim().toLowerCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim(),
        category_slug: formData.categorySlug || undefined,
        license: formData.license || undefined,
        compatibility: formData.compatibility || undefined,
        tags: formData.tags
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : undefined,
      };

      // Submit to API
      const response = await api.createSkill(payload);

      // Success - redirect to the created skill
      setSuccess(true);
      setTimeout(() => {
        navigate(`/skills/${response.data.full_id}`);
      }, 1500);

    } catch (err: any) {
      // Handle errors
      console.error('Submit error:', err);

      if (err.status === 401) {
        setError('Authentication failed. Please log in and try again.');
      } else if (err.status === 409) {
        setError('This skill already exists. Try a different slug.');
      } else if (err.status === 422 || err.status === 400) {
        setError(err.message || 'Invalid data. Please check your inputs.');
      } else {
        setError('Failed to submit skill. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const descCharCount = formData.description.length;
  const descMaxChars = 1024;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Skill
        </h1>
        <p className="text-gray-600">
          Share your awesome skill with the community
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

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-green-900">Success!</h3>
            <p className="text-sm text-green-700">Skill created successfully. Redirecting...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Skill Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="my-awesome-skill"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Must be lowercase. This will be part of your skill's unique identifier.
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="My Awesome Skill"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description * ({descCharCount}/{descMaxChars} characters)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              rows={3}
              placeholder="A brief description of what this skill does..."
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                descCharCount > descMaxChars
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-red-500'
              }`}
            />
            {descCharCount > descMaxChars && (
              <p className="text-sm text-red-600 mt-1">
                Description exceeds maximum length
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="categorySlug"
              value={formData.categorySlug}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              disabled={loading}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* License */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              License
            </label>
            <input
              type="text"
              name="license"
              value={formData.license}
              onChange={handleChange}
              disabled={loading}
              placeholder="MIT"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Compatibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compatibility
            </label>
            <input
              type="text"
              name="compatibility"
              value={formData.compatibility}
              onChange={handleChange}
              disabled={loading}
              placeholder="claude-code@1.0.0+"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructions *
            </label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              disabled={loading}
              rows={10}
              placeholder="Detailed instructions for using this skill..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Skill'
              )}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Submit;
