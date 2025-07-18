"use client"

import { useEffect, useState } from "react"

export default function QRCodeGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    const submitUrl = `${window.location.origin}/submit`
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(submitUrl)}`
    setQrCodeUrl(qrApiUrl)
  }, [])

  if (!qrCodeUrl) {
    return (
      <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-400">กำลังโหลด QR Code...</div>
      </div>
    )
  }

  return (
    <div className="w-62 h-62 bg-gray-100 rounded-xl flex items-center justify-center p-2">
      <img
        src={qrCodeUrl || "/placeholder.svg"}
        alt="QR Code to submit page"
        className="w-full h-full object-contain rounded-lg"
      />
    </div>
  )
}
