import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Tag } from '../types';
import { Loader2, Tag as TagIcon } from 'lucide-react';

const Tags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await api.getTags();
      setTags(response.data);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tags</h1>
        <p className="text-gray-600">Browse skills by tags</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-red-600" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/skills?tags=${tag.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full border border-gray-200 hover:border-red-300 transition-all"
              >
                <TagIcon size={16} />
                <span className="font-medium">{tag.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;
