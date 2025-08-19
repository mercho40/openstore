'use client'

import { useState, useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadImage, validateImageFile } from '@/actions/upload'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 10,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const currentImages = useMemo(() =>
    Array.isArray(value) ? value : value ? [value] : [],
    [value]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploading) return

      setError(null)
      setUploading(true)
      setUploadProgress(0)

      try {
        const validFiles = acceptedFiles.filter((file) => {
          if (!validateImageFile(file)) {
            setError(`Invalid file: ${file.name}. Must be JPEG, PNG, WebP, or GIF under 10MB.`)
            return false
          }
          return true
        })

        if (validFiles.length === 0) {
          setUploading(false)
          return
        }

        const filesToUpload = multiple
          ? validFiles.slice(0, maxFiles - currentImages.length)
          : [validFiles[0]]

        const uploadPromises = filesToUpload.map(async (file, index) => {
          const result = await uploadImage(file)
          setUploadProgress(((index + 1) / filesToUpload.length) * 100)
          return result.url
        })

        const uploadedUrls = await Promise.all(uploadPromises)

        if (multiple) {
          const newValue = [...currentImages, ...uploadedUrls].slice(0, maxFiles)
          onChange(newValue)
        } else {
          onChange(uploadedUrls[0])
        }
      } catch (error) {
        console.error('Upload failed:', error)
        setError('Upload failed. Please try again.')
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [disabled, uploading, currentImages, multiple, maxFiles, onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    multiple,
    disabled: disabled || uploading,
    maxFiles: multiple ? maxFiles - currentImages.length : 1,
  })

  const removeImage = (indexOrUrl: number | string) => {
    if (multiple && Array.isArray(value)) {
      const newValue = value.filter((_, i) => i !== indexOrUrl)
      onChange(newValue)
    } else {
      onChange('')
    }
  }

  const canUploadMore = multiple
    ? currentImages.length < maxFiles
    : currentImages.length === 0

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image Preview */}
      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {currentImages.map((url, index) => (
            <div key={url} className="group relative aspect-square">
              <Image
                src={url}
                alt={`Upload ${index + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(multiple ? index : url)}
                disabled={disabled || uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-muted-foreground/50',
            isDragActive && 'border-primary bg-primary/5',
            (disabled || uploading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="w-full max-w-xs space-y-2">
                <Upload className="mx-auto h-8 w-8 animate-pulse" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop images here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP, GIF (max 10MB each)
                    {multiple && ` • Up to ${maxFiles - currentImages.length} more files`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* File Count */}
      {multiple && currentImages.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {currentImages.length} of {maxFiles} images uploaded
        </p>
      )}
    </div>
  )
}
