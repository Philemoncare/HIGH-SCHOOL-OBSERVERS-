# Paystack Payment Integration Setup

## ✅ Configuration Complete

Your Paystack Live API keys have been integrated into the HSO Platform payment system.

## 📝 Keys Configured

- **Live Secret Key**: `sk_live_59cba101770a90bb6639ab261f72392b79bbaf4c` (Backend only)
- **Live Public Key**: `pk_live_b5adb3f2e761c78d17748f97681507fb77f0c82b` (Frontend)

## 🔧 Files Updated

### Backend
- ✅ `backend/.env` - Updated with Paystack Secret Key
- ✅ `backend/env.example` - Updated with key structure
- ✅ `backend/src/routes/payments.js` - Enhanced payment verification with order support

### Frontend
- ✅ `frontend/src/utils/paystackConfig.js` - Created Paystack configuration utility
- ✅ `frontend/src/pages/Payment.jsx` - Updated to use environment variable
- ⚠️ **IMPORTANT**: Create `frontend/.env` file (see instructions below)

## 📋 Manual Setup Required

### 1. Create Frontend .env File

Since `.env` files are protected, you need to manually create the frontend environment file:

**Create `frontend/.env` with the following content:**

```env
# Paystack Public Key (for client-side payment initialization)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_b5adb3f2e761c78d17748f97681507fb77f0c82b

# API Configuration
VITE_API_URL=http://localhost:5000
```

### 2. Restart Development Servers

After creating the `.env` file:

```powershell
# Stop both servers (Ctrl+C)
# Then restart them:

# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm run dev
```

## 🔄 Payment Flow

### Shop Purchases (Advanced Purchase Modal)
1. User fills purchase form → Creates order in database
2. Backend initializes Paystack payment → Returns authorization URL
3. User redirected to Paystack → Completes payment
4. Paystack redirects back → Backend verifies payment
5. Stock updated & Order status changed to "confirmed"

### Donations
1. User fills donation form
2. Backend initializes Paystack payment
3. User completes payment on Paystack
4. Backend verifies and updates campaign raised amount

### Event Registrations
1. User fills registration form
2. Backend initializes Paystack payment
3. User completes payment
4. Backend verifies and records registration

## 🔍 Testing

### Check Payment System Status

Visit: `http://localhost:5000/api/payments/status`

You should see:
```json
{
  "paystack_initialized": true,
  "api_key_configured": true,
  "api_key": "Configured",
  "status": "Payment system ready"
}
```

## 🛡️ Security Notes

- ✅ **Secret Key**: Only used in backend (never exposed to frontend)
- ✅ **Public Key**: Safe to use in frontend (already in Paystack config)
- ✅ **Payment Verification**: All payments verified server-side
- ✅ **Order Tracking**: Orders linked to payments via order_id in metadata

## 🚨 Important

1. **Never commit `.env` files** - They contain sensitive keys
2. **Use HTTPS in production** - Required for Paystack live mode
3. **Test payments** - Use Paystack test cards before going live
4. **Monitor transactions** - Check Paystack dashboard regularly

## 📚 Paystack Documentation

- Dashboard: https://dashboard.paystack.com
- API Docs: https://paystack.com/docs/api
- Test Cards: https://paystack.com/docs/payments/test-payments

## 🆘 Troubleshooting

### Payment Not Initializing
- Check backend is running on port 5000
- Verify `PAYSTACK_SECRET_KEY` in backend `.env`
- Check backend logs for errors

### Frontend Key Not Working
- Ensure `frontend/.env` exists with `VITE_PAYSTACK_PUBLIC_KEY`
- Restart frontend dev server after creating `.env`
- Check browser console for configuration errors

### Payment Verification Fails
- Check Paystack dashboard for transaction status
- Verify callback URLs are accessible
- Check backend logs for verification errors

