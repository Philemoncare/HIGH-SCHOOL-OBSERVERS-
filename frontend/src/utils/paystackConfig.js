/**
 * Paystack Configuration
 * 
 * This file manages Paystack public key configuration.
 * The public key is loaded from environment variables or defaults to a fallback.
 * 
 * IMPORTANT: Never expose secret keys in frontend code!
 * Only public keys should be used in the frontend.
 */

// Get Paystack public key from environment variable
// Vite requires VITE_ prefix for environment variables
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 
  'pk_live_b5adb3f2e761c78d17748f97681507fb77f0c82b'; // Fallback to live key

// Validate key format
export const isPaystackKeyValid = (key) => {
  if (!key) return false;
  // Paystack keys start with pk_live_ or pk_test_
  return key.startsWith('pk_live_') || key.startsWith('pk_test_');
};

// Check if we're using live or test mode
export const isPaystackLiveMode = () => {
  return PAYSTACK_PUBLIC_KEY.startsWith('pk_live_');
};

// Log configuration (for debugging - remove sensitive data in production)
export const logPaystackConfig = () => {
  if (import.meta.env.DEV) {
    console.log('Paystack Configuration:', {
      mode: isPaystackLiveMode() ? 'LIVE' : 'TEST',
      keyPrefix: PAYSTACK_PUBLIC_KEY.substring(0, 10) + '...',
      keyValid: isPaystackKeyValid(PAYSTACK_PUBLIC_KEY)
    });
  }
};

// Initialize Paystack configuration check
if (import.meta.env.DEV) {
  logPaystackConfig();
  
  if (!isPaystackKeyValid(PAYSTACK_PUBLIC_KEY)) {
    console.warn('⚠️ Warning: Invalid Paystack public key format. Payment may not work correctly.');
  }
}

export default {
  publicKey: PAYSTACK_PUBLIC_KEY,
  isLiveMode: isPaystackLiveMode(),
  isValid: isPaystackKeyValid(PAYSTACK_PUBLIC_KEY)
};

