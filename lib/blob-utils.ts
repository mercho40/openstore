export interface UploadResult {
  url: string
  pathname: string
  contentType: string
  contentDisposition: string
}

export function getImageUrl(pathname: string): string {
  return `${process.env.VERCEL_URL || 'http://localhost:3000'}/_vercel/blob/${pathname}`
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  return allowedTypes.includes(file.type) && file.size <= maxSize
}