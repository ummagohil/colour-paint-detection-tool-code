"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { storeImageData } from "@/lib/image-storage"
import { extractColours } from "@/lib/color-extractor"

interface ImageUploaderProps {
  onUploadStart: () => void
  onUploadComplete: () => void
}

export function ImageUploader({ onUploadStart, onUploadComplete }: ImageUploaderProps) {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)

    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG)")
      return
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB")
      return
    }

    setImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = async () => {
    if (!image || !preview) return

    try {
      setIsUploading(true)
      onUploadStart()

      // Generate a unique ID for this upload
      const uniqueId = `demo-${Date.now()}`

      // Actually extract colors from the image using ColorThief
      const extractedColours = await extractColours(preview)

      // Store the image data in our storage system
      storeImageData(uniqueId, preview, extractedColours)

      // Simulate a short processing delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onUploadComplete()
      router.push(`/results/${uniqueId}`)
    } catch (err) {
      console.error("Error processing image:", err)
      setError("Failed to analyze image colors. Please try again with a different image.")
      setIsUploading(false)
      onUploadComplete()
    }
  }

  const resetImage = () => {
    setImage(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-lg font-medium mb-2">Drop your image here or click to browse</span>
            <span className="text-sm text-muted-foreground">JPG, PNG (max 10MB)</span>
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
            onClick={resetImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

      {preview && (
        <div className="mt-4">
          <Button className="w-full" onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysing Colours...
              </>
            ) : (
              "Analyse Colours"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
