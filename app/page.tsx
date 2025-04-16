import Link from "next/link"
import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold">Paint Matcher</h1>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <div className="flex max-w-[980px] flex-col items-center gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              UK Paint Colour Matcher
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Upload a photo of your wall and we&apos;ll identify the closest matching paint colours from UK vendors.
            </p>
          </div>
          <div className="w-full max-w-[700px] mx-auto">
            <div className="flex flex-col items-center justify-center gap-4">
              <Link href="/upload" className="w-full">
                <Button className="w-full h-16 text-lg gap-2">
                  <Upload className="h-5 w-5" />
                  Upload an Image
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG (max 10MB)</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
