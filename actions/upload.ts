'use server'

import { put, del, list } from '@vercel/blob'
import { validateImageFile, getImageUrl, type UploadResult } from '@/lib/blob-utils'

// Re-export utilities for convenience
export { validateImageFile, getImageUrl, type UploadResult }

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

export async function uploadImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    if (!validateImageFile(file)) {
      return {
        success: false,
        error: 'Invalid file. Must be JPEG, PNG, WebP, or GIF under 10MB.'
      }
    }

    const result = await uploadImage(file)

    return {
      success: true,
      data: {
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
      }
    }
  } catch (error) {
    console.error('Upload action failed:', error)
    return {
      success: false,
      error: 'Upload failed. Please try again.'
    }
  }
}

export async function deleteImageAction(url: string) {
  try {
    await deleteImage(url)
    return { success: true }
  } catch (error) {
    console.error('Delete action failed:', error)
    return {
      success: false,
      error: 'Delete failed. Please try again.'
    }
  }
}

export async function uploadMultipleImagesAction(formData: FormData) {
  try {
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return { success: false, error: 'No files provided' }
    }

    const validFiles = files.filter(file => validateImageFile(file))

    if (validFiles.length === 0) {
      return {
        success: false,
        error: 'No valid files. Must be JPEG, PNG, WebP, or GIF under 10MB.'
      }
    }

    const uploadPromises = validFiles.map(file => uploadImage(file))
    const results = await Promise.all(uploadPromises)

    return {
      success: true,
      data: results.map(result => ({
        url: result.url,
        pathname: result.pathname,
        contentType: result.contentType,
      }))
    }
  } catch (error) {
    console.error('Multiple upload action failed:', error)
    return {
      success: false,
      error: 'Upload failed. Please try again.'
    }
  }
}
