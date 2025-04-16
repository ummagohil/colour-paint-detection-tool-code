"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ImageUploader } from "@/components/image-uploader"

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)

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
        <div className="max-w-[700px] mx-auto">
          <h1 className="text-2xl font-bold mb-6">Upload Your Wall Image</h1>
          <Card className="p-6">
            <ImageUploader onUploadStart={() => setIsUploading(true)} onUploadComplete={() => setIsUploading(false)} />
          </Card>
          <div className="mt-6">
            <p className="text-sm text-muted-foreground">For best results:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>Take photos in natural daylight</li>
              <li>Avoid shadows or strong reflections</li>
              <li>Capture a clean section of the wall</li>
              <li>Ensure the wall colour is the main subject</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
