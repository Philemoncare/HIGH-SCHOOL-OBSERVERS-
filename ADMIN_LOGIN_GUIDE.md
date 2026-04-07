# 🔐 Admin Dashboard Login Guide

## How to Access the Administrative Dashboard

### Step 1: Use the Regular Login Page

The HSO Platform uses a **single login page** for all users (regular users and admins). There is no separate admin login page.

1. **Go to the login page**: Navigate to `/login` or click "Login" in the navigation
2. **Enter your admin credentials** (see below)
3. **After successful login**, you'll be redirected to the homepage
4. **Access the admin dashboard** by:
   - Clicking "Admin Dashboard" in the navigation menu (visible only to admins)
   - Or directly navigating to `/admin`

### Step 2: Admin Credentials

#### Default Super Admin Account

The system automatically creates a super admin account when the database initializes:

- **Email**: `favmoms440@gmail.com`
- **Password**: `@Qwerty1234`

#### Admin Roles

The following roles can access the admin dashboard:
- **`super_admin`** - Full system access
- **`executive`** - Executive-level access
- **`admin`** - Admin-level access

### Step 3: Accessing Admin Dashboard

After logging in with admin credentials:

1. **From Navigation Menu**:
   - Look for "Admin Dashboard" link in the top navigation
   - This link only appears if you have admin/executive role

2. **Direct URL**:
   - Navigate to: `http://localhost:5173/admin` (or your domain)

3. **Admin Routes Available**:
   - `/admin` - Main dashboard
   - `/admin/users` - User management
   - `/admin/news` - News management
   - `/admin/events` - Events & Donations management
   - `/admin/shop` - Shop management
   - `/admin/payments` - Payment management
   - `/admin/leadership` - Leadership team management
   - `/admin/profile` - Admin profile

### Troubleshooting

#### ❌ "You are not authorized" or redirected to login

**Problem**: Your user account doesn't have admin privileges.

**Solutions**:
1. **Check your user role** in the database:
   ```bash
   # Connect to MongoDB and check your user
   db.users.findOne({ email: "your-email@gmail.com" })
   ```

2. **Update your role** (if you have database access):
   ```javascript
   db.users.updateOne(
     { email: "your-email@gmail.com" },
     { $set: { role: "super_admin" } }
   )
   ```

3. **Use the default super admin account**:
   - Email: `favmoms440@gmail.com`
   - Password: `@Qwerty1234`

#### ❌ Can't see "Admin Dashboard" link

**Problem**: Your account doesn't have admin/executive role.

**Solution**: 
- Make sure you're logged in with an account that has `role: 'super_admin'`, `role: 'executive'`, or `role: 'admin'`
- The navigation link only appears for users with these roles

#### ❌ Login works but can't access `/admin`

**Problem**: Your role might not be properly set or recognized.

**Solution**:
1. Check browser console for errors
2. Verify your user object has the correct role
3. Try logging out and logging back in
4. Clear browser cache and localStorage

### Creating Additional Admin Users

#### Option 1: Through Admin Dashboard (Recommended)

1. Log in as super admin
2. Go to `/admin/users`
3. Click "Create New User"
4. Set role to `super_admin`, `executive`, or `admin`
5. Fill in other required fields
6. Save

#### Option 2: Direct Database Update

If you have MongoDB access:

```javascript
// Connect to MongoDB
use hso_platform

// Update existing user to admin
db.users.updateOne(
  { email: "user@example.com" },
  { 
    $set: { 
      role: "super_admin",
      is_verified: true,
      is_approved: true
    } 
  }
)
```

#### Option 3: Using Backend Script

There's a script to create admin users:

```bash
cd backend
node create-admin-user.js
```

### Security Notes

⚠️ **Important Security Reminders**:

1. **Change the default password** after first login
2. **Use strong passwords** for admin accounts
3. **Limit admin access** to trusted personnel only
4. **Regularly audit** admin user list
5. **Enable 2FA** for admin accounts (if available)

### Quick Reference

| Item | Value |
|------|-------|
| Login URL | `/login` |
| Admin Dashboard URL | `/admin` |
| Default Admin Email | `favmoms440@gmail.com` |
| Default Admin Password | `@Qwerty1234` |
| Required Roles | `super_admin`, `executive`, or `admin` |

### Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Verify your MongoDB connection
3. Ensure the backend server is running
4. Check that your user exists in the database with the correct role

