import { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Github,
  FileDown,
  Lock,
  Clock,
  RefreshCw,
  LogIn,
} from 'lucide-react'

import { authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { ImportResponse, ImportJobResponse, ImportJob } from '../types'
import { isAsyncImportResponse } from '../types'

export default function Import() {
  const { isAuthenticated, signIn } = useAuth()

  const handleSignIn = () => {
    signIn('/import')
  }
  const [url, setUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)
  const [jobResponse, setJobResponse] = useState<ImportJobResponse | null>(null)
  const [jobStatus, setJobStatus] = useState<ImportJob | null>(null)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  const pollJobStatus = async (jobId: string) => {
    try {
      const response = await authApi.getJobStatus(jobId)
      setJobStatus(response.job)

      // Stop polling if job is completed or failed
      if (
        response.job.status === 'completed' ||
        response.job.status === 'failed'
      ) {
        setPolling(false)
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }

        // If completed, convert to regular result format
        if (response.job.status === 'completed') {
          setResult({
            success: true,
            imported: response.job.imported_skills || [],
            rejected: response.job.rejected_skills || [],
          })
          setJobResponse(null)
          setJobStatus(null)
        }
      }
    } catch (err) {
      console.error('Failed to poll job status:', err)
      // Don't stop polling on transient errors
    }
  }

  const startPolling = (jobId: string) => {
    setPolling(true)
    // Poll immediately
    pollJobStatus(jobId)
    // Then poll every 3 seconds
    pollIntervalRef.current = setInterval(() => pollJobStatus(jobId), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setJobResponse(null)
    setJobStatus(null)

    // Stop any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    try {
      const response = await authApi.submitRepo(url, isPrivate)

      // Check if this is an async response
      if (isAsyncImportResponse(response)) {
        setJobResponse(response)
        // Start polling for job status
        startPolling(response.job_id)
      } else {
        setResult(response)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="animate-pulse" size={20} />
      case 'processing':
        return <RefreshCw className="animate-spin" size={20} />
      case 'completed':
        return <CheckCircle size={20} />
      case 'failed':
        return <AlertCircle size={20} />
      default:
        return <Clock size={20} />
    }
  }

  return (
    <div className="bg-slate-50 dark:bg-[#0f172a] min-h-screen">
      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
          Submit a Skill
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Enter a GitHub repository URL to import skills. The repository should
          contain a{' '}
          <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">
            skills/
          </code>{' '}
          folder with skill subfolders containing{' '}
          <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-slate-700 dark:text-slate-300">
            SKILL.md
          </code>{' '}
          files.
        </p>

        {/* Sign-in prompt for unauthenticated users */}
        {!isAuthenticated ? (
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-6 text-center">
            <LogIn
              className="mx-auto text-slate-400 dark:text-slate-500 mb-4"
              size={48}
            />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Sign in to import skills
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              You need to be signed in to submit skills to the registry.
            </p>
            <button
              onClick={handleSignIn}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 inline-flex items-center gap-2"
            >
              <LogIn size={20} />
              Sign In
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Github
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo or owner/repo"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400 dark:placeholder-slate-500"
                    disabled={loading || polling}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || polling || !url.trim()}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
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
                <div className="mt-4 p-4 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Skill visibility:
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                        className="mt-0.5 w-4 h-4 border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500 bg-white dark:bg-slate-700"
                        disabled={loading || polling}
                      />
                      <div>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          Public
                        </span>
                        <p className="text-xs text-slate-500">
                          Visible to everyone in the skills registry
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <input
                        type="radio"
                        name="visibility"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                        className="mt-0.5 w-4 h-4 border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500 bg-white dark:bg-slate-700"
                        disabled={loading || polling}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            Private
                          </span>
                          <Lock size={14} className="text-slate-500" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Only visible to you in "My Skills"
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </form>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4 flex items-start gap-3">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                <div>{error}</div>
              </div>
            )}

            {/* Async Job Status */}
            {(jobResponse || jobStatus) && !result && (
              <div className="space-y-4 mb-4">
                <div className="border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 bg-white dark:bg-slate-800/50">
                  <div className="flex items-center gap-3 mb-3 text-slate-700 dark:text-slate-300">
                    {getStatusIcon(
                      jobStatus?.status || jobResponse?.status || 'pending',
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {jobStatus?.status === 'processing'
                          ? 'Processing Import...'
                          : jobStatus?.status === 'failed'
                            ? 'Import Failed'
                            : 'Import Queued'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Your skills will be available shortly
                      </p>
                    </div>
                  </div>

                  {jobStatus?.status === 'failed' && jobStatus.last_error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-red-700 dark:text-red-400 text-sm">
                      <span className="font-medium">Error: </span>
                      {jobStatus.last_error}
                    </div>
                  )}

                  {polling && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <RefreshCw className="animate-spin" size={12} />
                      Checking status...
                    </div>
                  )}
                </div>

                {/* Info box about async processing */}
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock
                      className="flex-shrink-0 mt-0.5 text-violet-600 dark:text-violet-400"
                      size={20}
                    />
                    <div className="text-sm text-violet-700 dark:text-violet-300">
                      <p>
                        You can safely navigate away. Your skills will appear in
                        the registry once processing is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.imported?.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle
                        className="text-emerald-600 dark:text-emerald-400"
                        size={20}
                      />
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
                        Successfully imported {result.imported.length} skill(s)
                      </h3>
                    </div>
                    <ul className="list-disc list-inside text-emerald-600 dark:text-emerald-400">
                      {result.imported.map(item => (
                        <li key={item.full_id}>{item.full_id}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-500">
                      Skills may take a moment to appear as they undergo AI
                      enrichment for categorization and tagging.
                    </p>
                  </div>
                )}

                {result.rejected?.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle
                        className="text-amber-600 dark:text-amber-400"
                        size={20}
                      />
                      <h3 className="font-semibold text-amber-700 dark:text-amber-300">
                        {result.rejected.length} item(s) could not be imported
                      </h3>
                    </div>
                    <ul className="list-disc list-inside text-amber-600 dark:text-amber-400">
                      {result.rejected.map((item, i) => (
                        <li key={i}>
                          {item.path}: {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Help text */}
        <div className="mt-8 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
            Supported URL formats:
          </h3>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-1">
            <li>
              <code className="text-slate-700 dark:text-slate-300">
                owner/repo
              </code>
            </li>
            <li>
              <code className="text-slate-700 dark:text-slate-300">
                owner/repo/custom-skills-path
              </code>
            </li>
            <li>
              <code className="text-slate-700 dark:text-slate-300">
                https://github.com/owner/repo
              </code>
            </li>
            <li>
              <code className="text-slate-700 dark:text-slate-300">
                https://github.com/owner/repo/tree/main/skills
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
