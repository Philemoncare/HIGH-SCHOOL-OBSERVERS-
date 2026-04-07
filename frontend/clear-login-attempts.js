// Clear login attempts from localStorage
console.log('🧹 Clearing login attempts...');

// Clear all login-related localStorage items
localStorage.removeItem('adminLoginLockout');
localStorage.removeItem('token');

console.log('✅ Login attempts cleared!');
console.log('📋 You can now try logging in again at: http://localhost:3004/admin-login');
console.log('📧 Email: favmoms440@gmail.com');
console.log('🔑 Password: @Qwerty1234'); 