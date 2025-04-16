import { ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PaintMatch } from "@/lib/types"

interface ColorResultsProps {
  colorMatch: {
    color: {
      hex: string
      percentage: number
    }
    vendorMatches: {
      vendor: string
      matches: PaintMatch[]
    }[]
  }
  index: number
}

export function ColorResults({ colorMatch, index }: ColorResultsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-md border shadow-sm flex-shrink-0"
            style={{ backgroundColor: colorMatch.color.hex }}
          />
          <div>
            <h2 className="text-lg font-medium">Matches for Detected Colour {index + 1}</h2>
            <p className="text-sm text-muted-foreground">
              {colorMatch.color.hex} ({colorMatch.color.percentage}% of wall)
            </p>
          </div>
        </div>

        <Tabs defaultValue={colorMatch.vendorMatches[0]?.vendor || "dulux"}>
          <TabsList className="w-full mb-4">
            {colorMatch.vendorMatches.map((vendorMatch) => (
              <TabsTrigger key={vendorMatch.vendor} value={vendorMatch.vendor} className="flex-1">
                {vendorMatch.vendor}
              </TabsTrigger>
            ))}
          </TabsList>

          {colorMatch.vendorMatches.map((vendorMatch) => (
            <TabsContent key={vendorMatch.vendor} value={vendorMatch.vendor}>
              <div className="space-y-4">
                {vendorMatch.matches.map((match, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-md hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-16 rounded-md border flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: match.hex }}
                      />
                      <div
                        className="w-16 h-16 rounded-md border flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: colorMatch.color.hex }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{match.name}</h3>
                      <p className="text-sm text-muted-foreground">{match.code}</p>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${match.matchPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm whitespace-nowrap">{match.matchPercentage}% match</span>
                      </div>
                    </div>
                    <a href={match.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
