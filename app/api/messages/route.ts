import { NextResponse } from "next/server"
import Redis from 'ioredis'

interface Message {
  id: string
  type: "text" | "image"
  content: string
  name: string
  timestamp: number
}

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export async function GET() {
  try {
    // Fetch all messages from Redis
    const messages = await redis.lrange('messages', 0, -1)
    const parsedMessages = messages.map((msg: string) => JSON.parse(msg))
    // Sort by timestamp, newest first, then reverse for display order
    const sortedMessages = parsedMessages.sort((a, b) => a.timestamp - b.timestamp)
    const res = NextResponse.json(sortedMessages)
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    res.headers.set("Pragma", "no-cache")
    res.headers.set("Expires", "0")
    res.headers.set("Surrogate-Control", "no-store")
    return res
  } catch (error) {
    console.error("Error reading messages from Redis:", error)
    return NextResponse.json([])
  }
}
