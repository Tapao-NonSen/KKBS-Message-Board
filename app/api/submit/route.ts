import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'
import Redis from 'ioredis'
import dotenv from "dotenv"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
dotenv.config()

interface Message {
  id: string
  type: "text" | "image"
  content: string
  name: string
  timestamp: number
}

const DO_SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT as string;
const DO_SPACES_KEY = process.env.DO_SPACES_KEY as string;
const DO_SPACES_SECRET = process.env.DO_SPACES_SECRET as string;
const DO_SPACES_BUCKET = process.env.DO_SPACES_BUCKET as string;
const DO_SPACES_REGION = process.env.DO_SPACES_REGION as string;

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const s3Client = new S3Client({
  region: DO_SPACES_REGION,
  endpoint: DO_SPACES_ENDPOINT,
  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received POST request")

    const formData = await request.formData()
    const name = formData.get("name") as string
    const message = formData.get("message") as string
    const image = formData.get("image") as File

    console.log("API: Form data received", {
      name: name?.trim(),
      hasMessage: !!message?.trim(),
      hasImage: !!image && image.size > 0,
      imageSize: image?.size || 0,
    })

    if (!name?.trim()) {
      console.log("API: Name validation failed")
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const hasMessage = message?.trim()
    const hasImage = image && image.size > 0

    if (!hasMessage && !hasImage) {
      console.log("API: Content validation failed - no message or image")
      return NextResponse.json({ error: "Either message or image is required" }, { status: 400 })
    }

    if (hasMessage && hasImage) {
      console.log("API: Content validation failed - both message and image provided")
      return NextResponse.json({ error: "Please submit either a message or an image, not both" }, { status: 400 })
    }

    if (hasImage) {
      const maxSize = 5 * 1024 * 1024
      if (image.size > maxSize) {
        console.log("API: Image size validation failed:", image.size)
        return NextResponse.json({ error: "Image size must be less than 5MB" }, { status: 400 })
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(image.type)) {
        console.log("API: Image type validation failed:", image.type)
        return NextResponse.json({ error: "Invalid image type. Only JPEG, PNG, GIF, and WebP are allowed" }, { status: 400 })
      }

      console.log("API: Image validation passed - Size:", image.size, "Type:", image.type)
    }

    console.log("API: Validation passed, creating message")

    const newMessage: Message = {
      id: uuidv4(),
      type: hasImage ? "image" : "text",
      content: "",
      name: name.trim(),
      timestamp: Date.now(),
    }

    if (hasImage) {
      console.log("API: Processing image upload to DigitalOcean Spaces")
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileExtension = image.name.split(".").pop() || "jpg"
      const fileName = `${uuidv4()}.${fileExtension}`
      // Upload to DigitalOcean Spaces
      const uploadParams = {
        Bucket: DO_SPACES_BUCKET,
        Key: fileName,
        Body: buffer,
        ContentType: image.type,
        ACL: "public-read" as const,
      }
      await s3Client.send(new PutObjectCommand(uploadParams))
      // Construct the public URL
      const publicUrl = `${DO_SPACES_ENDPOINT.replace(/\/$/, "")}/${DO_SPACES_BUCKET}/${fileName}`
      newMessage.content = publicUrl
      console.log("API: Image uploaded to", publicUrl)
    } else {
      newMessage.content = message.trim()
      console.log("API: Text message processed")
    }

    // Instead of reading/writing messages.json, use Redis
    // Save the new message to Redis
    await redis.lpush('messages', JSON.stringify(newMessage))
    console.log("API: Message saved to Redis successfully")

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error("API: Error in submit route:", error)
    return NextResponse.json(
      { error: `Failed to submit message: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}