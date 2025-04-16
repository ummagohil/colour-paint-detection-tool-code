"use client"

import ColorThief from "colorthief"

// Function to extract dominant colors from an image
export async function extractColours(imageUrl: string): Promise<{ hex: string; percentage: number }[]> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new image element
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Set up onload handler before setting src
      img.onload = () => {
        try {
          // Create a canvas to draw the image
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          // Set canvas dimensions to match image
          canvas.width = img.width
          canvas.height = img.height

          // Draw image on canvas
          ctx.drawImage(img, 0, 0)

          // Use ColorThief to extract colors
          const colorThief = new ColorThief()

          // Get dominant color
          const dominantColor = colorThief.getColor(img)

          // Get color palette (returns array of RGB arrays)
          const palette = colorThief.getPalette(img, 5)

          // Calculate color coverage (simplified approach)
          // In a real app, we'd analyze pixel distribution more accurately
          const totalPixels = img.width * img.height

          // Convert RGB to HEX and assign percentages
          const dominantHex = rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2])

          // Create results array with dominant color first
          const results = [
            { hex: dominantHex, percentage: 60 }, // Dominant color gets highest percentage
          ]

          // Add other colors from palette (excluding ones too similar to dominant)
          palette.forEach((color, index) => {
            const hex = rgbToHex(color[0], color[1], color[2])

            // Skip if too similar to dominant color
            if (colorDistance(dominantColor, color) < 25) return

            // Skip if too similar to any already added color
            for (const result of results) {
              if (hexDistance(result.hex, hex) < 25) return
            }

            // Calculate a percentage based on index (higher index = less prevalent)
            const percentage = Math.max(5, 30 - index * 5)

            results.push({ hex, percentage })
          })

          // Normalize percentages to sum to 100%
          const totalPercentage = results.reduce((sum, color) => sum + color.percentage, 0)
          const normalizedResults = results.map((color) => ({
            hex: color.hex,
            percentage: Math.round((color.percentage / totalPercentage) * 100),
          }))

          // Sort by percentage (highest first)
          normalizedResults.sort((a, b) => b.percentage - a.percentage)

          // Take top 3 colors
          resolve(normalizedResults.slice(0, 3))
        } catch (error) {
          console.error("Error extracting colors:", error)
          reject(error)
        }
      }

      img.onerror = (error) => {
        console.error("Error loading image:", error)
        reject(error)
      }

      // Set the image source (do this after setting onload/onerror)
      img.src = imageUrl
    } catch (error) {
      console.error("Error in extractColours:", error)
      reject(error)
    }
  })
}

// Helper function to convert RGB to HEX
function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
      })
      .join("")
  )
}

// Helper function to calculate color distance between two RGB colors
function colorDistance(rgb1: number[], rgb2: number[]): number {
  const rDiff = rgb1[0] - rgb2[0]
  const gDiff = rgb1[1] - rgb2[1]
  const bDiff = rgb1[2] - rgb2[2]

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

// Helper function to calculate color distance between two HEX colors
function hexDistance(hex1: string, hex2: string): number {
  // Convert hex to RGB
  const rgb1 = hexToRgb(hex1)
  const rgb2 = hexToRgb(hex2)

  if (!rgb1 || !rgb2) return 100

  const rDiff = rgb1.r - rgb2.r
  const gDiff = rgb1.g - rgb2.g
  const bDiff = rgb1.b - rgb2.b

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff)
}

// Helper function to convert HEX to RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}
