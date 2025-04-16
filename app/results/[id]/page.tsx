"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ColorResults } from "@/components/color-results"
import { getPaintMatches } from "@/lib/color-matcher"
import { getImageData } from "@/lib/image-storage"
import { Skeleton } from "@/components/ui/skeleton"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const [loading, setLoading] = useState(true)
  const [imageData, setImageData] = useState<any>(null)
  const [paintMatches, setPaintMatches] = useState<any[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the image data and extracted colours from our storage
        const imageId = params.id
        console.log("Fetching data for image ID:", imageId)

        const data = getImageData(imageId)

        if (!data) {
          console.error("No image data found for ID:", imageId)
          setError(true)
          setLoading(false)
          return
        }

        setImageData(data)

        // Get paint matches for the extracted colours
        const matches = await getPaintMatches(data.extractedColours)
        setPaintMatches(matches)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching results:", err)
        setError(true)
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-lg font-semibold">Paint Matcher</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="max-w-[900px] mx-auto">
            <h1 className="text-2xl font-bold mb-6">Analysing Your Image</h1>

            <div className="grid grid-cols-1 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Uploaded Image</h2>
                  <Skeleton className="w-full aspect-video rounded-md" />
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Skeleton className="w-24 h-6" />
                    <Skeleton className="w-24 h-6" />
                    <Skeleton className="w-24 h-6" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium mb-4">Matching Paint Colours</h2>
                  <Skeleton className="w-full h-8 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-full h-20" />
                    <Skeleton className="w-full h-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !imageData) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b">
          <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-lg font-semibold">Paint Matcher</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 container py-8">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="text-2xl font-bold mb-6">Image Not Found</h1>
            <p className="mb-6">Sorry, we couldn't find the image you're looking for.</p>
            <Link href="/upload">
              <Button>Upload a New Image</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-lg font-semibold">Paint Matcher</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-2xl font-bold mb-6">Your Paint Colour Results</h1>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Uploaded Image</h2>
              <div className="relative aspect-video overflow-hidden rounded-md">
                <Image
                  src={imageData.imageUrl || "/placeholder.svg"}
                  alt="Uploaded wall image"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Detected Colours:</h3>
                <div className="flex flex-wrap gap-3">
                  {imageData.extractedColours.map((colour: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-md border shadow-sm" style={{ backgroundColor: colour.hex }} />
                      <div className="mt-1 text-xs text-center">
                        <div>{colour.hex}</div>
                        <div>{colour.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {paintMatches.map((colorMatch, index) => (
            <ColorResults key={index} colorMatch={colorMatch} index={index} />
          ))}

          <div className="mt-8 flex justify-center">
            <Link href="/upload">
              <Button>Upload Another Image</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
