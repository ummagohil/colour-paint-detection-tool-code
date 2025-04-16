import type { ExtractedColor } from "./types"
import { paintDatabase } from "./paint-database"

// Calculate colour distance using Delta E (improved version)
function getColourDistance(hex1: string, hex2: string): number {
  const lab1 = hexToLab(hex1)
  const lab2 = hexToLab(hex2)

  if (!lab1 || !lab2) return 100

  // Calculate Delta E (CIE76 formula - simplified but better than RGB distance)
  const lDiff = lab1.l - lab2.l
  const aDiff = lab1.a - lab2.a
  const bDiff = lab1.b - lab2.b

  return Math.sqrt(lDiff * lDiff + aDiff * aDiff + bDiff * bDiff)
}

// Convert hex to RGB
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

// Convert RGB to LAB color space (better for perceptual color matching)
function rgbToLab(r: number, g: number, b: number) {
  // Convert RGB to XYZ
  r = r / 255
  g = g / 255
  let blue = b / 255

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92

  r = r * 100
  g = g * 100
  blue = blue * 100

  const x = r * 0.4124 + g * 0.3576 + blue * 0.1805
  const y = r * 0.2126 + g * 0.7152 + blue * 0.0722
  const z = r * 0.0193 + g * 0.1192 + blue * 0.9505

  // Convert XYZ to LAB
  const xRef = 95.047
  const yRef = 100.0
  const zRef = 108.883

  let xNorm = x / xRef
  let yNorm = y / yRef
  let zNorm = z / zRef

  xNorm = xNorm > 0.008856 ? Math.pow(xNorm, 1 / 3) : 7.787 * xNorm + 16 / 116
  yNorm = yNorm > 0.008856 ? Math.pow(yNorm, 1 / 3) : 7.787 * yNorm + 16 / 116
  zNorm = zNorm > 0.008856 ? Math.pow(zNorm, 1 / 3) : 7.787 * zNorm + 16 / 116

  const l = 116 * yNorm - 16
  const a = 500 * (xNorm - yNorm)
  const bValue = 200 * (yNorm - zNorm) // Renamed from 'b' to 'bValue' to avoid conflict

  return { l, a, b: bValue } // Return with the correct property name
}

// Convert hex to LAB
function hexToLab(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToLab(rgb.r, rgb.g, rgb.b)
}

// Calculate match percentage based on colour distance
function calculateMatchPercentage(distance: number): number {
  // For LAB color space, a distance of 2.3 is just noticeable difference
  // A distance of 0 is a perfect match (100%)
  // A distance of 100 or more is a complete mismatch (0%)
  const percentage = Math.max(0, 100 - distance * 1.5)
  return Math.round(percentage)
}

// Find the closest paint matches for a specific color
function findClosestMatches(targetColor: ExtractedColor, vendorColors: any[], maxMatches = 3) {
  return vendorColors
    .map((paint) => {
      const distance = getColourDistance(targetColor.hex, paint.hex)
      const matchPercentage = calculateMatchPercentage(distance)

      return {
        ...paint,
        matchPercentage,
      }
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxMatches)
}

export async function getPaintMatches(extractedColours: ExtractedColor[]) {
  // For each extracted colour, find matches from each vendor
  const results = extractedColours.map((extractedColor) => {
    // Find matches for this color from each vendor
    const vendorMatches = paintDatabase.vendors.map((vendor) => {
      const matches = findClosestMatches(extractedColor, vendor.colours)

      return {
        vendor: vendor.name,
        matches,
      }
    })

    return {
      color: extractedColor,
      vendorMatches,
    }
  })

  return results
}
