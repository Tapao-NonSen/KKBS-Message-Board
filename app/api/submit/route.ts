import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from 'uuid'
import Redis from 'ioredis'
import dotenv from "dotenv"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { google } from 'googleapis'
dotenv.config()

interface Message {
  id: string
  type: "text" | "image"
  content: string
  name: string
  timestamp: number
}

// Environment variables
const IMAGE_MODE = process.env.IMAGE_MODE || 'digitalocean' // 'digitalocean' or 'googledrive'

// DigitalOcean Spaces configuration
const DO_SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT as string;
const DO_SPACES_KEY = process.env.DO_SPACES_KEY as string;
const DO_SPACES_SECRET = process.env.DO_SPACES_SECRET as string;
const DO_SPACES_BUCKET = process.env.DO_SPACES_BUCKET as string;
const DO_SPACES_REGION = process.env.DO_SPACES_REGION as string;

// Google Drive configuration
const GOOGLE_DRIVE_CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID as string;
const GOOGLE_DRIVE_CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET as string;
const GOOGLE_DRIVE_REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN as string;
const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID as string;

const redis = new Redis(process.env.REDIS_URL as string, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Initialize DigitalOcean Spaces client
const s3Client = new S3Client({
  region: DO_SPACES_REGION,
  endpoint: DO_SPACES_ENDPOINT,
  credentials: {
    accessKeyId: DO_SPACES_KEY,
    secretAccessKey: DO_SPACES_SECRET,
  },
})

// Initialize Google Drive client
const getGoogleDriveClient = () => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_DRIVE_CLIENT_ID,
    GOOGLE_DRIVE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({
    refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN,
  });
  
  return google.drive({ version: 'v3', auth: oauth2Client });
};

// Upload to DigitalOcean Spaces
async function uploadToDigitalOcean(image: File, fileName: string): Promise<string> {
  const bytes = await image.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const uploadParams = {
    Bucket: DO_SPACES_BUCKET,
    Key: fileName,
    Body: buffer,
    ContentType: image.type,
    ACL: "public-read" as const,
  }
  
  await s3Client.send(new PutObjectCommand(uploadParams))
  const publicUrl = `${DO_SPACES_ENDPOINT.replace(/\/$/, "")}/${DO_SPACES_BUCKET}/${fileName}`
  
  console.log("API: Image uploaded to DigitalOcean Spaces:", publicUrl)
  return publicUrl
}

// Upload to Google Drive
async function uploadToGoogleDrive(image: File, fileName: string): Promise<string> {
  const drive = getGoogleDriveClient()
  const bytes = await image.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const fileMetadata = {
    name: fileName,
    parents: [GOOGLE_DRIVE_FOLDER_ID],
  };
  
  const media = {
    mimeType: image.type,
    body: buffer,
  };
  
  const file = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id,webViewLink',
  });
  
  // Make the file publicly accessible
  await drive.permissions.create({
    fileId: file.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  
  // Get the direct download link
  const directLink = `https://drive.google.com/uc?export=view&id=${file.data.id}`
  
  console.log("API: Image uploaded to Google Drive:", directLink)
  return directLink
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Received POST request")
    console.log("API: Image mode:", IMAGE_MODE)

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
      const fileExtension = image.name.split(".").pop() || "jpg"
      const fileName = `${uuidv4()}.${fileExtension}`
      
      let publicUrl: string
      
      if (IMAGE_MODE === 'googledrive') {
        console.log("API: Processing image upload to Google Drive")
        
        // Validate Google Drive configuration
        if (!GOOGLE_DRIVE_CLIENT_ID || !GOOGLE_DRIVE_CLIENT_SECRET || !GOOGLE_DRIVE_REFRESH_TOKEN || !GOOGLE_DRIVE_FOLDER_ID) {
          console.error("API: Google Drive configuration missing")
          return NextResponse.json({ error: "Google Drive configuration is incomplete" }, { status: 500 })
        }
        
        publicUrl = await uploadToGoogleDrive(image, fileName)
      } else {
        console.log("API: Processing image upload to DigitalOcean Spaces")
        
        // Validate DigitalOcean configuration
        if (!DO_SPACES_ENDPOINT || !DO_SPACES_KEY || !DO_SPACES_SECRET || !DO_SPACES_BUCKET || !DO_SPACES_REGION) {
          console.error("API: DigitalOcean Spaces configuration missing")
          return NextResponse.json({ error: "DigitalOcean Spaces configuration is incomplete" }, { status: 500 })
        }
        
        publicUrl = await uploadToDigitalOcean(image, fileName)
      }
      
      newMessage.content = publicUrl
    } else {
      newMessage.content = message.trim()
      console.log("API: Text message processed")
    }

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