'use server'

import { getModuleResources } from '@/lib/database/queries'
import { createClient } from '@/lib/supabase/server'
import type { Resource } from '@/lib/database/types'

/**
 * Get resources for a module
 */
export async function getModuleResourcesAction(moduleId: string): Promise<{
  resources: Resource[]
  error?: string
}> {
  try {
    const resources = await getModuleResources(moduleId)
    return { resources }
  } catch (error) {
    console.error('Error fetching module resources:', error)
    return {
      resources: [],
      error: error instanceof Error ? error.message : 'Failed to fetch resources',
    }
  }
}

/**
 * Generate a signed URL for a resource file
 * @param fileUrl - The file URL or storage path from the database
 * @returns Signed URL that expires in 1 hour, or error
 */
export async function generateSignedUrl(fileUrl: string): Promise<{
  signedUrl: string | null
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    // Extract storage path from file_url
    // Handle both formats:
    // 1. Storage path: "module-id/filename.mcx"
    // 2. Full URL: "https://project.supabase.co/storage/v1/object/public/resources/module-id/filename.mcx"
    let storagePath = fileUrl
    
    // If it's a full URL, extract the path
    try {
      const url = new URL(fileUrl)
      // Extract path after /storage/v1/object/public/ or /storage/v1/object/sign/
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/(?:public|sign)\/(.+)/)
      if (pathMatch && pathMatch[1]) {
        storagePath = pathMatch[1]
      }
    } catch {
      // Not a URL, assume it's already a storage path
      storagePath = fileUrl
    }
    
    // Remove bucket name from path if present (e.g., "Resources/module-id/file.mcx" -> "module-id/file.mcx")
    if (storagePath.startsWith('Resources/')) {
      storagePath = storagePath.replace('Resources/', '')
    }
    if (storagePath.startsWith('resources/')) {
      storagePath = storagePath.replace('resources/', '')
    }
    
    // Generate signed URL (expires in 1 hour = 3600 seconds)
    const { data, error } = await supabase.storage
      .from('Resources')
      .createSignedUrl(storagePath, 3600)
    
    if (error) {
      console.error('Error generating signed URL:', error)
      return {
        signedUrl: null,
        error: error.message || 'Failed to generate download link',
      }
    }
    
    if (!data?.signedUrl) {
      return {
        signedUrl: null,
        error: 'No signed URL generated',
      }
    }
    
    return {
      signedUrl: data.signedUrl,
    }
  } catch (error) {
    console.error('Exception generating signed URL:', error)
    return {
      signedUrl: null,
      error: error instanceof Error ? error.message : 'Failed to generate download link',
    }
  }
}
