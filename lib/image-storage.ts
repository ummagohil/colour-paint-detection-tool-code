import type { ExtractedColor } from "./types"

// Mock storage for image data
// In a real app, this would be a database
const imageStorage: Record<
  string,
  {
    imageUrl: string
    extractedColours: ExtractedColor[]
  }
> = {}

// Export the storage object for debugging purposes
export const debugStorage = imageStorage

export function storeImageData(imageId: string, imageUrl: string, extractedColours: ExtractedColor[]) {
  // Store the data in our storage object
  imageStorage[imageId] = {
    imageUrl,
    extractedColours,
  }

  // Log for debugging
  console.log(`Stored image data for ID: ${imageId}`, { imageUrl, extractedColours })
  console.log("Current storage:", imageStorage)
}

export function getImageData(imageId: string) {
  // Log for debugging
  console.log(`Getting image data for ID: ${imageId}`)
  console.log("Current storage:", imageStorage)
  console.log("Found data:", imageStorage[imageId])

  return imageStorage[imageId]
}
