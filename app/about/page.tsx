import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function AboutPage() {
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
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-2xl font-bold mb-6">About Paint Matcher</h1>

          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">How It Works</h2>
              <p className="text-muted-foreground">
                Paint Matcher uses advanced colour analysis algorithms to identify the dominant colours in your wall
                photos and match them to paint colours from major UK vendors. Our tool analyses your uploaded images,
                extracts the key colours, and finds the closest matching paint colours from our extensive database.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Supported Paint Vendors</h2>
              <p className="text-muted-foreground mb-3">
                We currently support paint colours from the following UK vendors:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Dulux</li>
                <li>Farrow & Ball</li>
                <li>Crown</li>
                <li>Little Greene</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We're constantly expanding our database to include more vendors and colour options.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Tips for Best Results</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Take photos in natural daylight for the most accurate colour representation</li>
                <li>Avoid shadows or strong reflections on the wall</li>
                <li>Capture a clean section of the wall without furniture or decorations</li>
                <li>Ensure the wall colour is the main subject of the photo</li>
                <li>Take multiple photos from different angles for comparison</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Privacy</h2>
              <p className="text-muted-foreground">
                Your uploaded images are processed securely and are not shared with third parties. We only use your
                images to provide the colour matching service and may store them temporarily to improve our algorithms.
                You can request deletion of your data at any time.
              </p>
            </section>
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="/upload">
              <Button>Try Paint Matcher Now</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
