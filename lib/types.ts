export interface ExtractedColor {
  hex: string
  percentage: number
}

export interface PaintMatch {
  name: string
  code: string
  hex: string
  matchPercentage: number
  url?: string
}
