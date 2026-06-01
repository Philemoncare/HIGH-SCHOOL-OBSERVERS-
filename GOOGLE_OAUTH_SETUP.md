# Google OAuth Setup Guide

This guide will help you configure Google OAuth login for the HSO platform.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Click on the project dropdown at the top and select "New Project"
4. Enter project name: "HSO Platform" (or your preferred name)
5. Click "Create"

## Step 2: Enable Required APIs

1. In your project dashboard, go to "APIs & Services" → "Library"
2. Search and enable these APIs:
   - **Google+ API** (if available) or **People API**
   - **Google OAuth2 API**

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose **External** and click "Create"
3. Fill in the required information:
   - **App name**: HSO Platform
   - **User support email**: your-email@example.com
   - **Developer contact information**: your-email@example.com
4. Click "Save and Continue"
5. Add scopes (if needed): `email`, `profile`, `openid`
6. Click "Save and Continue"
7. Add test users (optional for development)
8. Click "Save and Continue" then "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "+ Create Credentials" → "OAuth client ID"
3. Select **Web application**
4. Application name: "HSO Platform Web"
5. **Authorized JavaScript origins**:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (alternative development)
   - `https://yourdomain.com` (production)
6. **Authorized redirect URIs**:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
7. Click "Create"

## Step 5: Update Environment Variables

Copy the **Client ID** from the credentials page and update both `.env` files:

### Backend (.env)
```bash
GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret
```

### Frontend (frontend/.env)
```bash
VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
```

## Step 6: Restart Services

1. Stop the current running services (Ctrl+C)
2. Restart with: `npm run dev`
3. The Google login button should now work!

## Testing

1. Navigate to the login page
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should be successfully logged in

## Troubleshooting

### "Google login is not configured yet"
- Check that `GOOGLE_CLIENT_ID` is set in backend `.env`
- Ensure it's not the placeholder value
- Restart the backend server

### "Invalid origin" error
- Make sure your domain is added to "Authorized JavaScript origins"
- Check for typos in the URL (http vs https)

### "redirect_uri_mismatch" error
- Verify the redirect URI matches exactly
- Include the trailing slash if required

### Frontend not loading Google button
- Check `VITE_GOOGLE_CLIENT_ID` in frontend `.env`
- Restart the frontend development server
- Check browser console for errors

## Production Deployment

For production deployment:

1. Add your production domain to authorized origins
2. Use HTTPS URLs (required for production)
3. Update environment variables with production values
4. Consider using environment-specific .env files

## Security Notes

- Never commit `.env` files to version control
- Use different client IDs for development and production
- Regularly rotate your client secrets
- Monitor your Google Cloud console for suspicious activity
