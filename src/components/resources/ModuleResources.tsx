'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { getModuleResourcesAction, generateSignedUrl } from '@/lib/actions/resources'
import type { Resource } from '@/lib/database/types'

interface ModuleResourcesProps {
  moduleId: string
  moduleTitle: string
}

export function ModuleResources({ moduleId, moduleTitle }: ModuleResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingResourceId, setDownloadingResourceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      setError(null)
      try {
        const { resources: fetchedResources, error: fetchError } =
          await getModuleResourcesAction(moduleId)
        if (fetchError) {
          setError(fetchError)
        } else {
          setResources(fetchedResources)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [moduleId])

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄'
    const type = fileType.toLowerCase()
    if (type.includes('mastercam') || type.includes('mcx') || type.includes('mcam')) return '🔧'
    if (type.includes('zip')) return '📦'
    if (type.includes('pdf')) return '📕'
    if (type.includes('image')) return '🖼️'
    return '📄'
  }

  const formatFileSize = (sizeKb?: number) => {
    if (!sizeKb) return ''
    if (sizeKb < 1024) return `${sizeKb} KB`
    return `${(sizeKb / 1024).toFixed(2)} MB`
  }

  const handleDownload = async (resource: Resource) => {
    setDownloadingResourceId(resource.id)
    
    try {
      // Generate signed URL
      const { signedUrl, error: urlError } = await generateSignedUrl(resource.file_url)
      
      if (urlError || !signedUrl) {
        setError(urlError || 'Failed to generate download link. Please try again.')
        setDownloadingResourceId(null)
        return
      }
      
      // Open signed URL in new tab for download
      window.open(signedUrl, '_blank')
      setDownloadingResourceId(null)
    } catch (err) {
      console.error('Download error:', err)
      setError(err instanceof Error ? err.message : 'Failed to download file. Please try again.')
      setDownloadingResourceId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-ink">Loading resources...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="error" className="m-4">
        {error}
      </Alert>
    )
  }

  if (resources.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-ink">
          <p className="text-lg font-medium mb-2">No resources available</p>
          <p className="text-sm">Resources for this module will appear here when they are added.</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-ink mb-2">Module Resources</h2>
        <p className="text-muted-ink">{moduleTitle}</p>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="text-3xl flex-shrink-0">
                  {getFileIcon(resource.file_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink mb-1 truncate">
                    {resource.title_en || resource.title_vi}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-ink">
                    {resource.file_type && (
                      <span className="capitalize">{resource.file_type}</span>
                    )}
                    {resource.file_size_kb && (
                      <span>{formatFileSize(resource.file_size_kb)}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleDownload(resource)}
                variant="primary"
                size="md"
                className="flex-shrink-0"
                disabled={downloadingResourceId === resource.id}
              >
                {downloadingResourceId === resource.id ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
