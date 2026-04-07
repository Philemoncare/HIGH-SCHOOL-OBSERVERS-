# High School Observer (HSO) Platform

A comprehensive web platform for school representatives, executives, and public users to connect, share, and collaborate in the educational ecosystem.

## 🚀 Features

### 🔐 User Roles & Access Levels
- **Super Admin**: Full system control, user management, content, shop, analytics, settings
- **Executives**: Profile management, event monitoring, representative oversight
- **School Reps**: Register, update profile, participate in events, access resources
- **Public Users**: View content, shop, donate, register for events

### 📈 Core Modules
1. **Representatives Registration** - Multi-step verified registration with admin approval
2. **Representative Profiling** - Public/private profiles with social links and badges
3. **Executive Profiling** - Official HSO executives display with portfolios
4. **News Article System** - Blog-style publishing with WYSIWYG editor and SEO
5. **Online Shop** - Product listings, cart system, payment integration
6. **Event Ticketing** - Event management with QR codes and email confirmations
7. **About HSO** - Timeline, mission, vision, team highlights
8. **Fundraising & Donations** - Campaigns with progress tracking and transparency
9. **HSO Events/Initiatives** - Calendar view with filtering and galleries
10. **Magazine** - Online view with flipbook interface and archives
11. **Admin Dashboard** - Metrics, analytics, downloadable reports

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Payments**: Paystack, Flutterwave

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hso-platform
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb hso_platform

# Set up database tables
npm run setup:db
```

### 4. Environment Configuration
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

### 5. Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:3000
```

## 📁 Project Structure

```
hso-platform/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── database/       # Database config and setup
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── env.example
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and styling
│   ├── package.json
│   └── vite.config.js
├── package.json            # Root package.json
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables
- `DB_*`: PostgreSQL database configuration
- `JWT_SECRET`: JWT signing secret
- `CLOUDINARY_*`: Cloudinary file storage
- `PAYSTACK_*`: Paystack payment gateway
- `SMTP_*`: Email configuration
 - `MAILCHIMP_API_KEY`: Mailchimp API key
 - `MAILCHIMP_SERVER_PREFIX`: Mailchimp server prefix (e.g., `us21`)
 - `MAILCHIMP_AUDIENCE_ID`: Mailchimp Audience/List ID

### Newsletter (Mailchimp) Setup
1. Create a Mailchimp account and an Audience (List).
2. Find your API key and server prefix in your Mailchimp account.
3. Copy your Audience ID from Audience Settings.
4. In `backend/.env`, set:
   - `MAILCHIMP_API_KEY=...`
   - `MAILCHIMP_SERVER_PREFIX=usXX`
   - `MAILCHIMP_AUDIENCE_ID=...`
5. The backend subscribes users via `/api/newsletter/subscribe` using double opt-in (`status: pending`).
   - If env vars are missing, the endpoint returns 202 Accepted as a soft success.

### Newsletter (Brevo/Sendinblue) Free Setup
Brevo offers a usable free plan (300 emails/day, unlimited contacts).

1. Create a Brevo account and verify your sender domain.
2. In Brevo, create a contact list and note its ID.
3. Create a Double Opt-In template and note its Template ID.
4. In `backend/.env`, set:
   - `BREVO_API_KEY=...`
   - `BREVO_LIST_ID=123` (numeric)
   - `BREVO_DOI_TEMPLATE_ID=45` (numeric, optional for DOI)
   - `BREVO_REDIRECT_URL=https://your-site.com/newsletter/confirmed` (for DOI)
5. Behavior:
   - If Brevo DOI vars are set, backend sends DOI email and returns `status: pending`.
   - If only `BREVO_LIST_ID` is set, backend adds contact directly and returns `status: subscribed`.
   - If Brevo not configured, backend falls back to Mailchimp if available; otherwise returns 202 Accepted.

### Frontend Environment Variables
- `VITE_API_URL`: Backend API URL (production: `https://high-school-observers-backend.onrender.com`)
- `VITE_CLOUDINARY_URL`: Cloudinary URL
- `VITE_PAYSTACK_PUBLIC_KEY`: Paystack public key

## 📊 Database Schema

The platform uses PostgreSQL with the following main tables:
- `users` - User accounts and profiles
- `news_articles` - News and blog posts
- `events` - Event management
- `shop_products` - E-commerce products
- `donations` - Donation tracking
- `magazine_issues` - Magazine publications
- `comments` - User comments system
- `audit_logs` - System activity tracking

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend
```

## 🚀 Deployment

### Live backend (Render)

- **API base URL**: [https://high-school-observers-backend.onrender.com](https://high-school-observers-backend.onrender.com)
- **Health check**: [https://high-school-observers-backend.onrender.com/api/health](https://high-school-observers-backend.onrender.com/api/health)

When deploying the frontend (e.g. Vercel), set `VITE_API_URL=https://high-school-observers-backend.onrender.com`. On Render, set `BACKEND_URL` to that same URL for CORS.

### Vercel (Recommended)

Deploy backend and frontend as two Vercel projects.

#### 1) Backend Project (Root: `backend`)
- Settings → General → Root Directory: `backend` → Save → Redeploy
- Environment Variables:
  - `MONGO_URI` (required)
  - `JWT_SECRET` (required)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (optional)
- Build & Runtime:
  - Framework Preset: Other
  - Node.js 20
  - Install: auto
  - Build: auto
  - Output: not required (serverless)
- Verify after deploy:
  - Visit `/` → should return `{ success: true }`
  - Visit `/api/health`
  - Visit `/api/news/public`

#### 2) Frontend Project (Root: `frontend`)
- Settings → General → Root Directory: `frontend`
- Environment Variables:
  - `VITE_API_URL=https://high-school-observers-backend.onrender.com` (or your backend URL)
- Build:
  - Install: auto
  - Build Command: `npm run build`
  - Output Directory: `dist`

#### Local and CI setup
- Copy example envs:
  - `backend/env.example` → `backend/.env`
  - `frontend/.env.example` → `frontend/.env`
- For GitHub Actions, ensure the frontend build uses `VITE_API_URL` via Vercel/Actions secrets if needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗓️ Development Timeline

- **Phase 1**: Design & Planning (1 week)
- **Phase 2**: Backend Development (2 weeks)
- **Phase 3**: Frontend Development (2 weeks)
- **Phase 4**: Testing & QA (1 week)
- **Phase 5**: Deployment & Launch (3-4 days)

---

**Built with ❤️ by the HSO Development Team** 

---

## 🧐 Issues Observed
- The navbar is very tall and the logo/text alignment looks off.
- The navigation links and buttons (Login/Register) are not vertically centered.
- The spacing between nav items is inconsistent.
- The navbar background is white, but the buttons are dark, making them stand out too much.
- The overall look is not as modern or clean as it could be.

---

## 🛠️ How to Fix the Navbar

1. **Use Flexbox for Centering**
   - Make sure the navbar uses `flex` and `items-center` for vertical alignment.

2. **Consistent Spacing**
   - Use `gap-x-6` or similar for horizontal spacing between nav items.

3. **Logo and Title Alignment**
   - Place the logo and title in a flex container, align items center, and add a small gap.

4. **Button Styling**
   - Use consistent button styles for Login/Register, and make them match the theme.

5. **Responsive Design**
   - Ensure the navbar looks good on all screen sizes.

---

## ✨ Example Tailwind Navbar Code

Here’s a modern, clean navbar you can use as a reference or drop into your `Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-2 px-4">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="HSO Logo" className="h-10 w-10" />
          <span className="font-bold text-xl text-red-800">High School Observer</span>
        </Link>
        {/* Nav Links */}
        <div className="flex items-center gap-x-6">
          <Link to="/" className="hover:text-red-700 font-medium">Home</Link>
          <Link to="/about" className="hover:text-red-700 font-medium">About</Link>
          <Link to="/news" className="hover:text-red-700 font-medium">News</Link>
          <Link to="/events" className="hover:text-red-700 font-medium">Events</Link>
          <Link to="/shop" className="hover:text-red-700 font-medium">Shop</Link>
          <Link to="/donations" className="hover:text-red-700 font-medium">Donations</Link>
          <Link to="/magazine" className="hover:text-red-700 font-medium">Magazine</Link>
        </div>
        {/* Auth Buttons */}
        <div className="flex items-center gap-x-2">
          <Link to="/login" className="px-4 py-2 border border-red-800 text-red-800 rounded hover:bg-red-50 transition">Login</Link>
          <Link to="/register" className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition">Register</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

---

## ✅ Next Steps

1. Update your `Navbar.jsx` with the above code or similar improvements.
2. Make sure your logo path is correct (`/logo.png` or wherever your logo is).
3. Adjust colors and spacing as needed to match your brand.

Would you like me to update your `Navbar.jsx` file for you? If yes, I can do it automatically! 

---

## 🛠️ Promote a User to Admin in MongoDB

1. **Open your MongoDB client**  
   (MongoDB Compass, Atlas, or the terminal with `mongo` or `mongosh`).

2. **Select your database**  
   For example, if your database is called `hso_platform`:
   ```js
   use hso_platform
   ```

3. **Find the user you want to promote**  
   You can search by email or username. For example:
   ```js
   db.users.find({ email: "user@example.com" })
   ```

4. **Update the user’s role to `super_admin` or `executive`**  
   Run this command (replace the email with the correct one):
   ```js
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { role: "super_admin" } }
   )
   ```
   - You can also use `"executive"` if you want that role.

5. **(Optional) Approve or verify the user if needed**  
   If your system requires approval or verification, you can also set:
   ```js
   db.users.updateOne(
     { email: "user@example.com" },
     { $set: { is_approved: true, is_verified: true } }
   )
   ```

6. **Log in with that user**  
   - Go to your app’s login page and use the credentials for that user.
   - You should now have access to the admin dashboard and admin routes.

---

**If you need to create a new user directly in MongoDB, let me know and I’ll give you the command for that as well!** 

---

## 🛠️ How to Use a Separate Database for HSO Platform

### 1. **Set a Unique Database Name in Your HSO Project**

In your HSO backend, you likely have a MongoDB connection string in your environment variables (usually in `.env`):

```
MONGODB_URI=mongodb://localhost:27017/hso_platform
```
or
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hso_platform
```

- The part after the last `/` is the database name (`hso_platform`).
- Make sure this is **different** from your e-commerce site’s database name.

---

### 2. **Check Your Backend Code**

In your backend code (often in `backend/src/database/config.js` or similar), make sure it uses the `MONGODB_URI` from your `.env` file.

Example (Node.js/Mongoose):
```js
mongoose.connect(process.env.MONGODB_URI, { ...options })
```

---

### 3. **Start Fresh**

- With the correct database name in your `.env`, when you run your HSO backend, it will create and use a new, separate database.
- Your e-commerce data will remain untouched in its own database.

---

### 4. **If You Use MongoDB Atlas (Cloud)**
- You can have multiple databases in the same cluster.
- Just use a different database name in the connection string for each project.

---

## ✅ Summary

- **Set a unique database name** for HSO in your `.env` and backend config.
- **Restart your backend** after changing the `.env`.
- **Your HSO and e-commerce data will be completely separate.**

---

If you want, I can help you:
- Edit your `.env` file for the correct database name.
- Double-check your backend connection code.
- Guide you through the process step-by-step.

Just let me know what you’d like to do! 

---

Absolutely! Separating the admin login portal from the normal user login is a great way to improve security and user experience. Here’s how you can do it:

---

## 🛠️ How to Create a Separate Admin Login Portal

### 1. **Create a New Admin Login Page**
- Add a new route and page, e.g. `/admin-login` or `/admin/login`.
- This page should have its own login form.

### 2. **Admin Login Logic**
- On this page, after login, check if the user is an admin (`role: super_admin` or `executive`).
- If not, show an error: “You are not authorized to access the admin portal.”
- If yes, redirect to `/dashboard` or `/admin`.

### 3. **Normal User Login Remains Unchanged**
- The regular `/login` page is for all users.
- Only users with admin roles can use the admin login page.

---

## ✨ Example Implementation

### **A. Add a New Page: `AdminLogin.jsx`**
```jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || 'Login failed')
    } else if (
      result.user.role !== 'super_admin' &&
      result.user.role !== 'executive'
    ) {
      setError('You are not authorized to access the admin portal.')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Admin Login</h2>
      {error && <div className="text-red-600">{error}</div>}
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Admin Email" required />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  )
}

export default AdminLogin
```

### **B. Add a Route in `App.jsx`**
```jsx
import AdminLogin from './pages/AdminLogin'
// ...
<Route path="/admin-login" element={<AdminLogin />} />
```

### **C. (Optional) Remove “Admin” Links from Normal Login**
- Only show the admin login link on the homepage or in a special place, not on the normal login page.

---

## ✅ Result

- **Normal users** use `/login` and can never access the admin dashboard.
- **Admins** use `/admin-login` and are only allowed in if their role is correct.

---

If you want, I can generate the full code for your project structure—just let me know! 