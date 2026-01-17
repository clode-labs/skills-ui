import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2,
  Save,
  Send,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

import { api } from '../services/api'
import type { Skill, SkillVersion, ApiError } from '../types'

const SkillEditor = () => {
  const { owner, slug } = useParams<{ owner: string; slug: string }>()

  const [skill, setSkill] = useState<Skill | null>(null)
  const [draft, setDraft] = useState<SkillVersion | null>(null)
  const [versions, setVersions] = useState<SkillVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [instructions, setInstructions] = useState('')
  const [publishVersion, setPublishVersion] = useState('')
  const [publishChangelog, setPublishChangelog] = useState('')
  const [showPublishModal, setShowPublishModal] = useState(false)

  useEffect(() => {
    if (owner && slug) {
      loadSkillData()
    }
  }, [owner, slug])

  const loadSkillData = async () => {
    try {
      setLoading(true)
      setError(null)

      // First fetch skill details to get the skill ID
      const skillResponse = await api.getSkill(owner!, slug!)
      const skillData = skillResponse.data
      setSkill(skillData)

      // Now fetch draft and versions using the skill ID
      const [draftResponse, versionsResponse] = await Promise.all([
        api.getSkillDraft(skillData.id),
        api.getSkillVersions(skillData.id),
      ])

      setDraft(draftResponse.data)
      setVersions(versionsResponse.data)
      setInstructions(draftResponse.data.instructions)
    } catch (err) {
      console.error('Error loading skill data:', err)
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to load skill data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!skill) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await api.updateSkillDraft(skill.id, {
        instructions: instructions,
      })

      setDraft(response.data)
      setSuccess('Draft saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving draft:', err)
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!skill) return

    try {
      setPublishing(true)
      setError(null)

      await api.publishSkillVersion(skill.id, {
        version: publishVersion || undefined,
        changelog: publishChangelog || undefined,
      })

      setShowPublishModal(false)
      setPublishVersion('')
      setPublishChangelog('')
      setSuccess('Version published successfully!')

      // Reload versions
      const versionsResponse = await api.getSkillVersions(skill.id)
      setVersions(versionsResponse.data)

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error publishing version:', err)
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to publish version')
    } finally {
      setPublishing(false)
    }
  }

  const hasChanges = draft ? instructions !== draft.instructions : false

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-red-600" size={40} />
      </div>
    )
  }

  if (error && !skill) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Skill</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Link
                to="/my-skills"
                className="inline-flex items-center gap-2 mt-4 text-red-600 hover:text-red-700"
              >
                <ArrowLeft size={16} />
                Back to My Skills
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/my-skills"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{skill?.name}</h1>
            <p className="text-gray-500">{skill?.full_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Save Draft
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            disabled={publishing || hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasChanges ? 'Save your draft before publishing' : ''}
          >
            <Send size={18} />
            Publish
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle
            className="text-red-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle
            className="text-green-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Editor */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-900">
                Draft Instructions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Edit your skill instructions below. Save your changes before
                publishing.
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={25}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm resize-none"
                placeholder="Enter your skill instructions..."
              />
            </div>
          </div>
        </div>

        {/* Versions Sidebar */}
        <div className="w-72">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Versions</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {versions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <p className="text-sm">No published versions yet</p>
                  <p className="text-xs mt-1">
                    Publish your first version to see it here
                  </p>
                </div>
              ) : (
                versions.map(version => (
                  <div
                    key={version.id}
                    className={`px-4 py-3 ${version.is_latest ? 'bg-green-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        v{version.version}
                      </span>
                      {version.is_latest && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          Latest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Clock size={12} />
                      {version.published_at
                        ? new Date(version.published_at).toLocaleDateString()
                        : 'Draft'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Publish New Version
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version (optional)
                </label>
                <input
                  type="text"
                  value={publishVersion}
                  onChange={e => setPublishVersion(e.target.value)}
                  placeholder="e.g., 1.0.0 (auto-incremented if empty)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changelog (optional)
                </label>
                <textarea
                  value={publishChangelog}
                  onChange={e => setPublishChangelog(e.target.value)}
                  rows={3}
                  placeholder="Describe what changed in this version..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SkillEditor
