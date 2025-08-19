'use client'

import { useState } from 'react'
import { ImageUpload } from '@/components/primitives/image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ImageUploadExample() {
  const [singleImage, setSingleImage] = useState<string>('')
  const [multipleImages, setMultipleImages] = useState<string[]>([])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Image Upload Examples</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {/* Single Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Single Image Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={singleImage}
              onChange={(value) => setSingleImage(value as string)}
              multiple={false}
            />
            {singleImage && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Image:</p>
                <p className="text-xs text-muted-foreground break-all">
                  {singleImage}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSingleImage('')}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multiple Images Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Multiple Images Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImageUpload
              value={multipleImages}
              onChange={(value) => setMultipleImages(value as string[])}
              multiple={true}
              maxFiles={5}
            />
            {multipleImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Current Images ({multipleImages.length}):</p>
                <div className="space-y-1">
                  {multipleImages.map((url, index) => (
                    <p key={url} className="text-xs text-muted-foreground break-all">
                      {index + 1}. {url}
                    </p>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMultipleImages([])}
                >
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}