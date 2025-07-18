"use client"

import { useState, useEffect } from "react"

export default function RealTimeClock() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const thaiDays = ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์"]
      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ]

      const dayName = thaiDays[now.getDay()]
      const day = now.getDate()
      const month = thaiMonths[now.getMonth()]
      const year = now.getFullYear() + 543
      const hours = now.getHours().toString().padStart(2, "0")
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const seconds = now.getSeconds().toString().padStart(2, "0")

      const timeString = `${dayName}ที่ ${day} ${month} ${year} เวลา ${hours}:${minutes}:${seconds}`
      setCurrentTime(timeString)
    }

    updateTime()

    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return <span>{currentTime}</span>
}
