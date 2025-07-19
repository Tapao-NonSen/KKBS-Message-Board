# Ledger of Memories (Message Wall)

A Next.js app for displaying and submitting messages and images for the KKBS at Khon Kaen University.

---

## Features
- Submit text or image messages
- **Dual image storage support**: DigitalOcean Spaces or Google Drive
- Messages stored in Redis (cloud, e.g., Redis Cloud or Upstash)
- Live message wall display
- Configurable image storage provider via environment variables

---

## Prerequisites
- Node.js 18+
- npm or pnpm
- Redis database (cloud, e.g., Redis Cloud, Upstash, etc.)
- **Image Storage**: Either DigitalOcean Spaces OR Google Drive API access

---

## Environment Variables
Create a `.env` file in the project root with the following:

### Required for all configurations:
```
# Redis (cloud instance, e.g., Redis Cloud, Upstash, Aiven, etc.)
REDIS_URL=redis://:<password>@<host>:<port>

# Image Storage Mode (choose one: 'digitalocean' or 'googledrive')
IMAGE_MODE=digitalocean
```

### For DigitalOcean Spaces (when IMAGE_MODE=digitalocean):
```
# DigitalOcean Spaces
DO_SPACES_ENDPOINT=https://<region>.digitaloceanspaces.com
DO_SPACES_KEY=<your-space-access-key>
DO_SPACES_SECRET=<your-space-secret-key>
DO_SPACES_BUCKET=<your-space-bucket-name>
DO_SPACES_REGION=<region>
```

### For Google Drive (when IMAGE_MODE=googledrive):
```
# Google Drive API
GOOGLE_DRIVE_CLIENT_ID=<your-google-drive-client-id>
GOOGLE_DRIVE_CLIENT_SECRET=<your-google-drive-client-secret>
GOOGLE_DRIVE_REFRESH_TOKEN=<your-google-drive-refresh-token>
GOOGLE_DRIVE_FOLDER_ID=<your-google-drive-folder-id>
```

---

## Setup & Development

1. **Install dependencies:**
   ```sh
   npm install
   # or
   pnpm install
   ```

2. **Choose your image storage provider:**
   - **DigitalOcean Spaces**: Set `IMAGE_MODE=digitalocean` and configure DigitalOcean variables
   - **Google Drive**: Set `IMAGE_MODE=googledrive` and configure Google Drive variables
   
   See [IMAGE_STORAGE_SETUP.md](./IMAGE_STORAGE_SETUP.md) for detailed setup instructions.

3. **Add your environment variables** to `.env` as shown above.

4. **Run the development server:**
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
- Ensure your chosen image storage provider is properly configured.

---

## File Uploads
- **DigitalOcean Spaces**: Images are uploaded to your configured Space with public read access
- **Google Drive**: Images are uploaded to your specified Google Drive folder and made publicly accessible
- Images are automatically validated for size (max 5MB) and type (JPEG, PNG, GIF, WebP)
- Public URLs are stored with each message for display

---

## Switching Image Storage Providers
To switch between DigitalOcean Spaces and Google Drive:
1. Update the `IMAGE_MODE` environment variable
2. Ensure all required environment variables for the new provider are configured
3. Restart the application

The application will automatically use the appropriate storage service based on the `IMAGE_MODE` setting.

---

## Customization
- Update logos in the `/public` directory as needed.
- Edit UI in `app/page.tsx` and related components.
- Configure image storage settings in `app/api/submit/route.ts`.

---

## License
MIT 
