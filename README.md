# Ledger of Memories (BACC Alumni Message Wall)

A Next.js app for displaying and submitting messages and images for the KKBS at Khon Kaen University.

---

## Features
- Submit text or image messages
- Images stored on DigitalOcean Spaces
- Messages stored in Redis (cloud, e.g., Redis Cloud or Upstash)
- Live message wall display

---

## Prerequisites
- Node.js 18+
- npm or pnpm
- Redis database (cloud, e.g., Redis Cloud, Upstash, etc.)
- DigitalOcean Spaces bucket

---

## Environment Variables
Create a `.env` file in the project root with the following:

```
# Redis (cloud instance, e.g., Redis Cloud, Upstash, Aiven, etc.)
REDIS_URL=redis://:<password>@<host>:<port>

# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://<region>.digitaloceanspaces.com
DO_SPACES_KEY=<your-space-access-key>
DO_SPACES_SECRET=<your-space-secret-key>
DO_SPACES_BUCKET=<your-space-bucket-name>
DO_SPACES_REGION=<region>
```

---

## Setup & Development

1. **Install dependencies:**
   ```sh
   npm install
   # or
   pnpm install
   ```

2. **Add your environment variables** to `.env` as shown above.

3. **Run the development server:**
   ```sh
   npm run dev
   # or
   pnpm dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## Deployment
- Deploy to Vercel or your preferred Node.js hosting.
- Set the same environment variables in your deployment environment.

---

## File Uploads
- Images are uploaded to DigitalOcean Spaces and the public URL is stored with each message.
- Make sure your Space allows public read access for uploaded files.

---

## Customization
- Update logos in the `/public` directory as needed.
- Edit UI in `app/page.tsx` and related components.

---

## License
MIT 