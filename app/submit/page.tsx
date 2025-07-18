"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Send, MessageSquare, ImageIcon, Sparkles, Heart, Star } from "lucide-react"
import { AdBanner } from "@/components/ad-banner"
import Script from "next/script"

type SubmissionType = "message" | "image" | null

const successMessages = [
  "เจ๋งมาก!",
  "สุดยอด!",
  "เยี่ยมเลย!",
  "ดีใจจัง!",
  "เก่งมาก!",
  "น่ารักจัง!",
  "เจ๋งจริงๆ!",
  "ดีมากเลย!",
  "เลิศเลย!",
  "เจ๋งสุดๆ!",
]

export default function SubmitPage() {
  const [submissionType, setSubmissionType] = useState<SubmissionType>(null)
  const [message, setMessage] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        alert("ขนาดไฟล์ใหญ่เกินไป! กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 5MB")
        e.target.value = ""
        return
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        alert("ประเภทไฟล์ไม่ถูกต้อง! กรุณาเลือกรูปภาพประเภท JPEG, JPG PNG, GIF หรือ WebP")
        e.target.value = ""
        return
      }

      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      alert("กรุณาใส่ชื่อของคุณ!")
      return
    }

    if (!submissionType) {
      alert("กรุณาเลือกส่งข้อความหรือรูปภาพ!")
      return
    }

    if (submissionType === "message" && !message.trim()) {
      alert("กรุณาใส่ข้อความของคุณ!")
      return
    }

    if (submissionType === "image" && !image) {
      alert("กรุณาเลือกรูปภาพ!")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name.trim())

      if (submissionType === "image" && image) {
        formData.append("image", image)
      } else if (submissionType === "message" && message.trim()) {
        formData.append("message", message.trim())
      }

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]
        setSuccessMessage(randomMessage)
        setSubmitted(true)
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))

        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("Submission error:", error)
      alert(`ส่งข้อความไม่สำเร็จ: ${error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSubmissionType(null)
    setMessage("")
    setImage(null)
    setImagePreview(null)
    setName("")
    setSuccessMessage("")
  }

  const handleNewSubmission = () => {
    setSubmitted(false)
    setSubmissionType(null)
    setMessage("")
    setImage(null)
    setImagePreview(null)
    setName("")
    setSuccessMessage("")
  }

  if (submitted) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url('/ledger-bg-pattern.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Celebration animations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 animate-bounce">
              <Star className="w-12 h-12 text-blue-300 fill-current" />
            </div>
            <div className="absolute top-32 right-32 animate-pulse">
              <Heart className="w-10 h-10 text-slate-300 fill-current" />
            </div>
            <div className="absolute bottom-32 left-1/3 animate-bounce delay-500">
              <Sparkles className="w-14 h-14 text-white" />
            </div>
          </div>

          <Card className="bg-slate-800/60 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-slate-600/30 text-center max-w-md w-full relative z-10">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h2 className="text-3xl font-black text-white mb-4">{successMessage}</h2>
            <p className="text-slate-300 text-lg mb-6">
              {submissionType === "message" ? "ข้อความ" : "รูปภาพ"}ของคุณถูกส่งไปยัง LEDGER OF MEMORIES แล้ว!
            </p>
            <div className="space-y-4">
              <Button
                onClick={handleNewSubmission}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 rounded-2xl py-3 text-lg font-bold shadow-lg transform hover:scale-105 transition-all"
              >
                ส่งข้อความใหม่
              </Button>
            </div>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url('/ledger-bg-pattern.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-16 w-16 h-16 bg-blue-400/20 rounded-full opacity-60 animate-pulse" />
          <div className="absolute top-40 right-24 w-12 h-12 bg-indigo-400/30 rounded-full opacity-70 animate-bounce" />
          <div className="absolute bottom-24 left-24 w-20 h-20 bg-slate-400/20 rounded-full opacity-50 animate-pulse delay-1000" />

          <div className="absolute top-32 left-1/4 animate-float">
            <Sparkles className="w-8 h-8 text-blue-300/60" />
          </div>
          <div className="absolute bottom-40 right-1/4 animate-float delay-1000">
            <Heart className="w-6 h-6 text-slate-300/60 fill-current" />
          </div>
        </div>

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2">บัญชี มข.</h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              LEDGER OF MEMORIES 2025
            </h2>
          </div>

          {/* Main form */}
          <div className="flex items-center justify-center">
            <Card className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-slate-600/30 max-w-lg w-full">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">📚</div>
                  <h2 className="text-2xl font-bold text-white">แบ่งปันความทรงจำของคุณ!</h2>
                  <p className="text-slate-300">เลือกส่งข้อความหรือรูปภาพ</p>
                </div>

                {/* Name input */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white font-bold">
                    ชื่อของคุณ *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="ใส่ชื่อของคุณ..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600/50 text-white placeholder:text-slate-400 rounded-2xl focus:border-blue-400 focus:ring-0"
                    maxLength={25}
                    required
                  />
                  <div className="text-right text-slate-400 text-sm">{name.length}/25</div>
                </div>

                {/* Submission Type Selection */}
                {!submissionType && (
                  <div className="space-y-4">
                    <Label className="text-white font-bold">เลือกสิ่งที่จะส่ง:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        onClick={() => setSubmissionType("message")}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-white border-2 border-slate-600/50 hover:border-blue-400/50 rounded-2xl py-8 flex flex-col items-center gap-2 h-auto"
                      >
                        <MessageSquare className="w-8 h-8" />
                        <span className="font-bold">ส่งข้อความ</span>
                        <span className="text-sm opacity-80">แบ่งปันความคิด</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSubmissionType("image")}
                        className="bg-slate-700/50 hover:bg-slate-600/50 text-white border-2 border-slate-600/50 hover:border-blue-400/50 rounded-2xl py-8 flex flex-col items-center gap-2 h-auto"
                      >
                        <ImageIcon className="w-8 h-8" />
                        <span className="font-bold">ส่งรูปภาพ</span>
                        <span className="text-sm opacity-80">แบ่งปันภาพ</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                {submissionType === "message" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="message" className="text-white font-bold">
                        ข้อความของคุณ *
                      </Label>
                      <Button
                        type="button"
                        onClick={resetForm}
                        className="text-slate-400 hover:text-white text-sm underline bg-transparent p-0 h-auto"
                      >
                        เปลี่ยนเป็นรูปภาพ
                      </Button>
                    </div>
                    <Textarea
                      id="message"
                      placeholder="เขียนความทรงจำของคุณ... 📚"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600/50 text-white placeholder:text-slate-400 rounded-2xl resize-none h-32 focus:border-blue-400 focus:ring-0"
                      maxLength={280}
                      required
                    />
                    <div className="text-right text-slate-400 text-sm">{message.length}/280</div>
                  </div>
                )}

                {/* Image Upload */}
                {submissionType === "image" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="image" className="text-white font-bold">
                        อัปโหลดรูปภาพ *
                      </Label>
                      <Button
                        type="button"
                        onClick={resetForm}
                        className="text-slate-400 hover:text-white text-sm underline bg-transparent p-0 h-auto"
                      >
                        เปลี่ยนเป็นข้อความ
                      </Button>
                    </div>
                    <p className="text-slate-400 text-xs mb-2">รองรับ JPEG, PNG, GIF, WebP | ขนาดไม่เกิน 5MB</p>
                    <div className="relative">
                      <Input
                        id="image"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600/50 text-white file:bg-slate-600/50 file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2 file:mr-4 rounded-2xl focus:border-blue-400"
                        required
                      />
                      <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>

                    {imagePreview && (
                      <div className="mt-4 text-center">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="ตัวอย่าง"
                          className="max-h-48 mx-auto rounded-2xl shadow-lg border-2 border-slate-600/30"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Submit button */}
                {submissionType && (
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !name.trim() ||
                      (submissionType === "message" && !message.trim()) ||
                      (submissionType === "image" && !image)
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white border-0 rounded-2xl py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-all disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        กำลังส่ง...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="w-5 h-5 mr-2" />
                        ส่ง{submissionType === "message" ? "ข้อความ" : "รูปภาพ"}!
                      </div>
                    )}
                  </Button>
                )}
              </form>

              <p className="text-slate-400 text-sm mt-4 text-center">
                ©{" "}
                <a href="https://tapao.nyxbot.app" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Tapao.me
                </a>{" "}
                - All Right Reserved
              </p>
            </Card>
          </div>
        </div>

        {/* <div className="px-8 pb-4">
          <AdBanner className="max-w-2xl mx-auto" />
        </div> */}
      </div>
    </>
  )
}