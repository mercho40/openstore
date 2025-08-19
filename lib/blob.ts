import { put, del, list } from '@vercel/blob'

export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export async function uploadImage(
  file: File,
  pathname?: string
): Promise<UploadResult> {
  try {
    const result = await put(pathname || file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return {
      url: result.url,
      pathname: result.pathname,
      contentType: result.contentType || file.type,
      contentDisposition: result.contentDisposition || '',
    }
  } catch (error) {
    console.error('Error uploading image to Vercel Blob:', error)
    throw new Error('Failed to upload image')
  }
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error('Error deleting image from Vercel Blob:', error)
    throw new Error('Failed to delete image')
  }
}

export async function listImages(prefix?: string) {
  try {
    const result = await list({ prefix })
    return result.blobs
  } catch (error) {
    console.error('Error listing images from Vercel Blob:', error)
    throw new Error('Failed to list images')
  }
}

export function getImageUrl(pathname: string): string {
  return `${process.env.VERCEL_URL || 'http://localhost:3000'}/_vercel/blob/${pathname}`
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  return allowedTypes.includes(file.type) && file.size <= maxSize
}