# Image Storage Configuration

This application supports two different image storage providers that can be configured using the `IMAGE_MODE` environment variable.

## Environment Variables

### Required for all modes:
- `IMAGE_MODE`: Set to `'digitalocean'` or `'googledrive'` (defaults to `'digitalocean'`)
- `REDIS_URL`: Your Redis connection URL

### DigitalOcean Spaces Configuration (when IMAGE_MODE=digitalocean):
- `DO_SPACES_ENDPOINT`: Your DigitalOcean Spaces endpoint (e.g., `https://nyc3.digitaloceanspaces.com`)
- `DO_SPACES_KEY`: Your DigitalOcean Spaces access key
- `DO_SPACES_SECRET`: Your DigitalOcean Spaces secret key
- `DO_SPACES_BUCKET`: Your bucket name
- `DO_SPACES_REGION`: Your region (e.g., `nyc3`)

### Google Drive Configuration (when IMAGE_MODE=googledrive):
- `GOOGLE_DRIVE_CLIENT_ID`: Your Google Drive API client ID
- `GOOGLE_DRIVE_CLIENT_SECRET`: Your Google Drive API client secret
- `GOOGLE_DRIVE_REFRESH_TOKEN`: Your Google Drive refresh token
- `GOOGLE_DRIVE_FOLDER_ID`: The ID of the Google Drive folder where images will be stored

## Setup Instructions

### DigitalOcean Spaces Setup:
1. Create a DigitalOcean account and set up Spaces
2. Create a new Space (bucket)
3. Generate API keys in the DigitalOcean dashboard
4. Configure the environment variables with your credentials

### Google Drive Setup:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs
5. Get a refresh token:
   - Use the Google OAuth 2.0 playground or a script to get a refresh token
   - The refresh token will be used to authenticate API requests
6. Create a folder in Google Drive and get its ID from the URL
7. Configure the environment variables with your credentials

## Example .env file:

```env
# Image Storage Mode
IMAGE_MODE=digitalocean

# Redis Configuration
REDIS_URL=redis://localhost:6379

# DigitalOcean Spaces Configuration
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_KEY=your_digitalocean_spaces_key
DO_SPACES_SECRET=your_digitalocean_spaces_secret
DO_SPACES_BUCKET=your_bucket_name
DO_SPACES_REGION=nyc3

# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
GOOGLE_DRIVE_REFRESH_TOKEN=your_google_drive_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id
```

## Switching Between Providers

To switch between providers, simply change the `IMAGE_MODE` environment variable:
- Set to `'digitalocean'` to use DigitalOcean Spaces
- Set to `'googledrive'` to use Google Drive

The application will automatically use the appropriate configuration and upload method based on this setting. 