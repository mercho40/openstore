'use server'

import { uploadImage, deleteImage, validateImageFile } from '@/lib/blob'

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