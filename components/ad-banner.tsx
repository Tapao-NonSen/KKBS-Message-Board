"use client"

import { useState, useEffect } from "react"
import { ExternalLink } from "lucide-react"

interface AdData {
  _id: string
  imageUrl: string
  linkUrl: string
  alt: string
  color: string
  expireAt: string | null
  type: number
}

interface AdBannerProps {
  className?: string
}

export function AdBanner({ className = "" }: AdBannerProps) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await fetch(`https://store.tapao.me/api/slice?time=${new Date().getTime()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch ad")
        }

        const adData: AdData = await response.json()
        if (adData.expireAt && new Date(adData.expireAt) < new Date()) {
          setError("Ad expired")
          return
        }

        setAd(adData)
      } catch (err) {
        console.error("Error fetching ad:", err)
        setError("Failed to load ad")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAd()

    setInterval(() => {
      fetchAd()
    }, 60 * 1000)
  }, [])

  if (isLoading) {
    return (
      <div className={`bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden animate-pulse ${className}`}>
        <div className="relative h-32">
          <div className="w-full h-full bg-white/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-3 bg-white/20 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ad) {
    return null
  }

  const handleAdClick = () => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div
      className={`bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:bg-white/15 transition-all duration-300 cursor-pointer group ${className}`}
      onClick={handleAdClick}
      style={{ borderLeft: `4px solid ${ad.color}` }}
    >
      <div className="relative h-32 overflow-hidden">
        {/* Full-size background image */}
        <img
          src={ad.imageUrl || "/placeholder.svg"}
          alt={ad.alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = "none"
          }}
        />

        {/* Gradient overlay from black to transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Text content overlaid on image */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {/* Top right corner - Click indicator */}
          <div className="flex justify-end">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Bottom content - Ad text */}
          <div className="flex items-end justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center text-white/80 text-xs">
                <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">Sponsored</span>
              </div>
              <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-pink-200 transition-colors mb-1 drop-shadow-lg">
                {ad.alt.length > 80 ? ad.alt.slice(0, 77) + "..." : ad.alt}
              </p>
            </div>

            {/* Action indicator */}
            <div className="flex-shrink-0">
              <div className="text-white/60 text-xs text-right">
                <span>Tap to visit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
