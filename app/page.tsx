"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Heart, Star, Zap } from "lucide-react"
import Image from "next/image"
import RealTimeClock from "@/components/real-time-clock"
import QRCodeGenerator from "@/components/qr-code-generator"

interface Message {
  id: string
  type: "text" | "image"
  content: string
  name: string
  timestamp: number
}

export default function LedgerOfMemoriesDisplay() {
  const [queue, setQueue] = useState<Message[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (queue.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % queue.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [queue])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?timestamp=${Date.now()}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()
      setQueue(data)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error")
    }
  }

  const currentMessage = queue[currentIndex]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-slate-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/ledger-bg-pattern.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80" />
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-full blur-lg animate-pulse delay-2000" />

        {/* Floating icons */}
        <div className="absolute top-20 right-20 animate-float">
          <Sparkles className="w-12 h-12 text-blue-300/40" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float delay-1000">
          <Heart className="w-10 h-10 text-slate-300/40 fill-current" />
        </div>
        <div className="absolute top-1/3 right-1/3 animate-float delay-2000">
          <Star className="w-8 h-8 text-gray-300/40 fill-current" />
        </div>
        <div className="absolute bottom-1/4 right-1/6 animate-float delay-3000">
          <Zap className="w-14 h-14 text-indigo-300/40" />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Elegant Sidebar */}
        <div className="w-96 bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/50 p-8 flex flex-col">
          {/* Header with new branding */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black text-white mb-2 leading-tight">บัญชี มข.</h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              LEDGER OF MEMORIES 2025
            </h2>
          </div>

          {/* Instructions */}
          <div className="mb-8 text-slate-200 text-base leading-relaxed space-y-3">
            <p className="font-medium text-xl">แสดงความรู้สึกหรือสิ่งที่คุณอยากจะบอกเกี่ยวกับงานนี้!</p>
            <p className="text-blue-300 font-semibold">สแกน QR Code เพื่อส่งข้อความหรือรูปภาพ</p>
          </div>

          {/* QR Code */}
          <div className="flex-1 flex flex-col items-center justify-center mb-10">
            <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-600/30 shadow-2xl">
              <QRCodeGenerator />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-300 space-y-3">
            {/* Add logos here */}
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30">
                <Image src="/kkbs-logo.jpg" alt="KKBS" width={50} height={35} className="rounded-lg object-contain" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30">
                <Image src="/kkbs-old.jpg" alt="BACC Alumni Logo" width={50} height={35} className="rounded-lg object-contain" />
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-slate-600/30">
                <div className="overflow-hidden rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-white/10">
                  <Image
                    src="/bacc.jpg"
                    alt="BACC Alumni Logo"
                    width={50}
                    height={50}
                    className="object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
            <p className="font-semibold text-slate-200">Bachelor of Accountancy</p>
            <p className="text-slate-400">Khon Kean Business School</p>
            <div className="bg-slate-800/40 backdrop-blur-sm rounded-full px-4 py-2 mt-4">
              <RealTimeClock />
            </div>
            <p className="text-blue-400 text-sm">© tapao.nyxbot.app - All Right Reserved</p>
          </div>
        </div>

        {/* Display Area */}
        <div className="flex-1 p-12 flex flex-col">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <h2 className="text-7xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl mb-4">
                Live Messages
              </h2>
              <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full mx-auto w-64" />
            </div>
            <p className="text-slate-300 text-xl font-light tracking-wide">ความรู้สึกและความทรงจำแห่งค่ำคืนสู่เหย้า</p>
          </div>

          {/* Content Display */}
          <div className="flex-1 flex items-center justify-center">
            {queue.length === 0 ? (
              <div className="text-center max-w-2xl">
                <div className="text-9xl mb-8 animate-pulse">📚</div>
                <h3 className="text-4xl font-bold text-white mb-6">รอข้อความจากทุกคน</h3>
                <p className="text-xl text-slate-400 mb-8 leading-relaxed">ข้อความและรูปภาพจะปรากฏที่นี่</p>
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl px-8 py-4 inline-block border border-slate-600/30">
                  <p className="text-blue-300 font-medium">สแกน QR Code เพื่อเริ่มต้น</p>
                </div>
                {error && (
                  <div className="mt-6 bg-red-500/20 backdrop-blur-sm text-red-300 px-6 py-3 rounded-xl border border-red-500/30">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-5xl">
                <Card className="bg-slate-800/40 backdrop-blur-xl border border-slate-600/30 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="p-12 text-center">
                    {currentMessage?.type === "image" ? (
                      <div className="space-y-8">
                        <div className="inline-block bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full px-8 py-4 border border-slate-600/30">
                          <h3 className="text-3xl font-bold text-white">✨ {currentMessage.name} ✨</h3>
                        </div>
                        <div className="relative">
                          <img
                            src={currentMessage.content || "/placeholder.svg"}
                            alt="User submission"
                            className="max-h-[500px] max-w-full w-auto h-auto mx-auto rounded-2xl shadow-2xl border border-slate-600/30 object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        <div className="inline-block bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full px-8 py-4 border border-slate-600/30">
                          <h3 className="text-3xl font-bold text-white">✨ {currentMessage.name} ✨</h3>
                        </div>
                        <p className="text-4xl font-bold text-white leading-relaxed break-words max-w-4xl mx-auto">
                          {currentMessage?.content}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Queue Indicator */}
          {queue.length > 1 && (
            <div className="mt-8 flex justify-center gap-3">
              {(() => {
                // Limit indicator to 5
                const maxIndicators = 5;
                let indicators = [];
                if (queue.length <= maxIndicators) {
                  indicators = queue.map((_, index) => index);
                } else {
                  // Show first, prev, current, next, last
                  const first = 0;
                  const last = queue.length - 1;
                  const prev = Math.max(currentIndex - 1, first + 1);
                  const next = Math.min(currentIndex + 1, last - 1);

                  if (currentIndex <= 1) {
                    // Show first 4 and last
                    indicators = [0, 1, 2, 3, last];
                  } else if (currentIndex >= last - 1) {
                    // Show first and last 4
                    indicators = [first, last - 3, last - 2, last - 1, last];
                  } else {
                    // Show first, prev, current, next, last
                    indicators = [first, prev, currentIndex, next, last];
                  }
                }
                // Remove duplicates and sort
                indicators = Array.from(new Set(indicators)).sort((a, b) => a - b);

                return indicators.map((index, i) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-500 ${index === currentIndex
                        ? "w-12 bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg"
                        : "w-2 bg-slate-600 hover:bg-slate-500"
                      }`}
                  >
                    {/* Show ellipsis if there is a gap */}
                    {i > 0 && indicators[i] - indicators[i - 1] > 1 && (
                      <span className="mx-1 text-slate-400 text-lg align-middle">…</span>
                    )}
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Status Footer */}
          <div className="text-center mt-8">
            {queue.length > 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-full px-8 py-3 inline-block border border-slate-600/30">
                <span className="text-slate-300 font-medium text-lg">
                  📝 {currentIndex + 1} / {queue.length} ข้อความ
                </span>
              </div>
            ) : (
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-full px-8 py-3 inline-block border border-slate-600/30">
                <span className="text-slate-300 font-medium text-lg">📚 พร้อมรับข้อความแรก</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
