import type React from "react"
import type { Metadata } from "next"
import { Kanit } from "next/font/google"
import "./globals.css"

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
})

export const metadata: Metadata = {
  title: "LEDGER OF MEMORIES 2025 - Interactive Message Wall",
  description: "Interactive message wall for LEDGER OF MEMORIES 2025 event",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} font-kanit antialiased`}>{children}</body>
    </html>
  )
}
