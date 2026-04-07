# Deploy HSO So It Works on Your Phone (Including Password Reset)

**Why "localhost refused to connect" on phone?**  
`localhost` on your phone means the phone itself. Your app runs on your PC. The phone can’t reach your PC at `localhost`, so reset links and the app fail on mobile.

**Fix:** Deploy the app so it has a **real URL** (e.g. `https://your-app.vercel.app`). Then use that URL everywhere, including password reset emails. It will work on phone, tablet, or any device.

---

## Sites That Help (Free Hosting)

| Service | Best for | Sign up | Docs |
|--------|----------|---------|------|
| **[Vercel](https://vercel.com)** | Frontend + Node API | [vercel.com/signup](https://vercel.com/signup) | [Deploy Node + Vite](https://vercel.com/docs/frameworks/vite) |
| **[Netlify](https://www.netlify.com)** | Frontend (React/Vite) | [netlify.com](https://www.netlify.com) | [Deploy React](https://docs.netlify.com/frameworks/react/) |
| **[Render](https://render.com)** | Backend + static frontend | [render.com](https://render.com) | [Static + Web Services](https://render.com/docs) |

---

## Quick Path: Vercel (Frontend + API)

You already have `vercel.json`. Use Vercel to deploy both frontend and API.

1. **Push your code to GitHub** (if you haven’t).
2. **Go to [vercel.com](https://vercel.com)** → Sign up / Log in.
3. **Import your GitHub repo** → Vercel detects the project.
4. **Configure:**
   - **Root Directory:** leave as repo root (or set to `frontend` if you deploy only frontend first).
   - **Build command:** `cd frontend && npm run build`
   - **Output directory:** `frontend/dist`
   - **Environment variables:** add `VITE_API_URL` = `https://your-api-url.vercel.app` (or your backend URL) when you deploy API.
5. **Deploy.** You’ll get a URL like `https://hso-xxx.vercel.app`.
6. **Backend:** Deploy API separately (same repo, `backend` folder, or use Vercel serverless). Set **`FRONTEND_URL`** in backend env to your frontend URL, e.g. `https://hso-xxx.vercel.app`.
7. **Password reset:** Emails will use `FRONTEND_URL/reset-password?token=...`. Open the link on your phone — it works.

---

## Alternative: Frontend on Netlify Only

If you run the **backend locally** (or elsewhere) and only need the frontend online:

1. **[netlify.com](https://www.netlify.com)** → Sign up → **Add new site** → **Import from Git**.
2. **Build settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
3. **Env:** `VITE_API_URL` = your backend URL (e.g. `https://your-backend.herokuapp.com` or a tunnel like **ngrok**).
4. Deploy. You get `https://your-site.netlify.app`.
5. In **backend** `.env`, set **`FRONTEND_URL=https://your-site.netlify.app`**. Restart backend.
6. Request password reset again. The link in the email works on your phone.

---

## Tunnels (No Deploy): Test on Phone Right Now

Use a tunnel so your **local** app is reachable via a public URL:

- **[ngrok](https://ngrok.com)** – [ngrok.com/download](https://ngrok.com/download)  
  - Run frontend: `npm run dev` in `frontend`.  
  - Run: `ngrok http 5173`  
  - Use the `https://xxx.ngrok.io` URL on your phone.  
- **[Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps)** – free, similar idea.

Set **`FRONTEND_URL`** in backend to the tunnel URL (e.g. `https://xxx.ngrok.io`), restart backend, then request a new reset email. The link will work on your phone.

---

## Summary

| Goal | What to do |
|------|------------|
| **"localhost refused" on phone** | Don’t use localhost on phone. Use a deployed URL or a tunnel. |
| **Password reset works on phone** | Set `FRONTEND_URL` in backend to that URL (Vercel, Netlify, or ngrok). |
| **Sites that help** | [Vercel](https://vercel.com), [Netlify](https://www.netlify.com), [Render](https://render.com), [ngrok](https://ngrok.com). |

Once `FRONTEND_URL` points to a real (or tunnel) URL, reset links in emails will work on your phone.
