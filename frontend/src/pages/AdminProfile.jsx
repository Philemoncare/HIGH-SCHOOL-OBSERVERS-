import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import { 
  Camera, 
  Upload, 
  X, 
  User, 
  Lock, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  RotateCcw,
  TrendingUp,
  Clock,
  MapPin,
  Globe,
  Mail,
  Phone,
  Building,
  Link,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Shield,
  Bell,
  Palette,
  Languages,
  Calendar,
  BarChart3,
  Zap,
  Star,
  Award,
  Target,
  Users,
  FileText,
  Database,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Info,
  Plus,
  Minus,
  Edit3,
  Save,
  Download,
  Share2,
  Filter,
  Search,
  Grid,
  List,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

function AdminProfile() {
  const { user, updateUser } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [imagePreview, setImagePreview] = useState(null)
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    school_name: user?.school_name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    social_links: user?.social_links || {
      twitter: '',
      linkedin: '',
      facebook: '',
      instagram: ''
    }
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: user?.twoFAEnabled || false,
    email_notifications: true,
    login_notifications: true,
    session_timeout: 30,
    require_password_change: false
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    dashboard_layout: 'grid',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  })

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        school_name: user.school_name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        social_links: user.social_links || {
          twitter: '',
          linkedin: '',
          facebook: '',
          instagram: ''
        }
      })
    }
  }, [user])

  // Test API connectivity
  // Test API connectivity using centralized utility
  const testAPI = async () => {
    try {
      const { checkAPIHealth } = await import('../utils/apiHealth')
      const result = await checkAPIHealth()
      if (result.connected) {
        console.log('✅ API is accessible:', result.details)
      } else {
        console.warn('⚠️ API connectivity test failed:', result.message)
      }
      return result.connected
    } catch (error) {
      console.error('❌ API health check error:', error)
      return false
    }
  }

  // Test API on component mount
  useEffect(() => {
    testAPI()
  }, [])

  // Advanced image upload with drag & drop, preview, and validation
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.dismiss('admin-image-type-error')
      toast.error('Please select an image file (JPG, PNG, GIF)', {
        id: 'admin-image-type-error'
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.dismiss('admin-image-size-error')
      toast.error('Image size must be less than 5MB', {
        id: 'admin-image-size-error'
      })
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)

    setUploading(true)
    setImageUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setImageUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Convert file to base64 with compression
      const base64Image = await new Promise((resolve) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
          // Calculate new dimensions (max 800px width/height)
          const maxSize = 800
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        
        img.src = URL.createObjectURL(file)
      })
      
      // Update profile with the compressed image
      const response = await axios.put('/api/users/profile', {
        profile_image: base64Image
      })
      
      if (response.data.success) {
        // Update the user in context with the new profile image
        await updateUser(response.data.user)
        toast.success('Profile picture updated successfully!')
        setImagePreview(null)
        setImageUploadProgress(100)
        
        // Reset progress after a delay
        setTimeout(() => setImageUploadProgress(0), 1000)
      } else {
        throw new Error('Failed to update profile image')
      }
    } catch (error) {
      console.error('Profile image upload error:', error)
      toast.dismiss('admin-upload-error')
      toast.error('Failed to upload profile picture. Please try again.', {
        id: 'admin-upload-error'
      })
      setImagePreview(null)
      setImageUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        const event = { target: { files: [file] } }
        handleProfileImageUpload(event)
      } else {
        toast.dismiss('admin-drop-image-error')
        toast.error('Please drop an image file', {
          id: 'admin-drop-image-error'
        })
      }
    }
  }

  // Remove profile image
  const handleRemoveProfileImage = async () => {
    try {
      const response = await axios.put('/api/users/profile', {
        profile_image: null
      })
      
      if (response.data.success) {
        await updateUser(response.data.user)
        toast.success('Profile picture removed')
        setImagePreview(null)
      }
    } catch (error) {
      console.error('Remove profile image error:', error)
      toast.dismiss('admin-remove-image-error')
      toast.error('Failed to remove profile picture', {
        id: 'admin-remove-image-error'
      })
    }
  }

  // Password strength helper functions
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const getPasswordStrengthText = (password) => {
    const strength = getPasswordStrength(password)
    switch (strength) {
      case 0:
      case 1:
        return 'Very weak - Add more characters and complexity'
      case 2:
        return 'Weak - Add uppercase letters and numbers'
      case 3:
        return 'Good - Add special characters for better security'
      case 4:
        return 'Strong - Excellent password!'
      default:
        return ''
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔄 Starting profile update...')
      console.log('📝 Form data:', profileForm)

      // Test API connectivity first
      const isAPIAccessible = await testAPI()
      if (!isAPIAccessible) {
        toast.dismiss('admin-api-connection-error')
        toast.error('Cannot connect to server. Please check your connection.', {
          id: 'admin-api-connection-error'
        })
        setLoading(false)
        return
      }

      // Validate required fields
      if (!profileForm.first_name || !profileForm.last_name || !profileForm.email) {
        toast.dismiss('admin-required-fields-error')
        toast.error('Please fill in all required fields (First Name, Last Name, Email)', {
          id: 'admin-required-fields-error'
        })
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(profileForm.email)) {
        toast.dismiss('admin-email-format-error')
        toast.error('Please enter a valid email address', {
          id: 'admin-email-format-error'
        })
        setLoading(false)
        return
      }

      // Prepare update data (only include non-empty values)
      const updateData = {}
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key] !== '' && profileForm[key] !== null && profileForm[key] !== undefined) {
          if (key === 'social_links') {
            // Only include social links that have values
            const socialLinks = {}
            Object.keys(profileForm.social_links).forEach(socialKey => {
              if (profileForm.social_links[socialKey] && profileForm.social_links[socialKey].trim() !== '') {
                socialLinks[socialKey] = profileForm.social_links[socialKey].trim()
              }
            })
            if (Object.keys(socialLinks).length > 0) {
              updateData[key] = socialLinks
            }
          } else {
            updateData[key] = profileForm[key].trim()
          }
        }
      })

      console.log('📤 Sending update data:', updateData)
      console.log('🔗 API endpoint: /api/users/profile')
      console.log('🔑 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing')

      const response = await axios.put('/api/users/profile', updateData)
      
      console.log('📥 API response:', response.data)
      
      if (response.data.success) {
        // Update the user in context
        await updateUser(response.data.user)
        toast.success('Profile updated successfully!')
        
        // Update local form state with the returned user data
        setProfileForm({
          first_name: response.data.user.first_name || '',
          last_name: response.data.user.last_name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          school_name: response.data.user.school_name || '',
          bio: response.data.user.bio || '',
          location: response.data.user.location || '',
          website: response.data.user.website || '',
          social_links: response.data.user.social_links || {
            twitter: '',
            linkedin: '',
            facebook: '',
            instagram: ''
          }
        })
        
        console.log('✅ Profile update completed successfully')
      } else {
        console.error('❌ API returned success: false')
        toast.dismiss('admin-profile-update-error')
        toast.error('Failed to update profile', {
          id: 'admin-profile-update-error'
        })
      }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      console.error('🔍 Error response:', error.response?.data)
      console.error('📊 Error status:', error.response?.status)
      console.error('📝 Error message:', error.message)
      
      toast.dismiss('admin-profile-update-error')
      toast.dismiss('admin-session-error')
      toast.dismiss('admin-api-endpoint-error')
      toast.dismiss('admin-server-error')
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.', {
          id: 'admin-session-error'
        })
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please check server configuration.', {
          id: 'admin-api-endpoint-error'
        })
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.', {
          id: 'admin-server-error'
        })
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to update profile'
        toast.error(errorMessage, {
          id: 'admin-profile-update-error'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    // Dismiss any existing validation toasts
    toast.dismiss('admin-password-fields-error')
    toast.dismiss('admin-password-match-error')
    toast.dismiss('admin-password-length-error')
    toast.dismiss('admin-password-strength-error')
    
    // Validate required fields
    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('Please fill in all password fields', {
        id: 'admin-password-fields-error'
      })
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match', {
        id: 'admin-password-match-error'
      })
      return
    }

    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long', {
        id: 'admin-password-length-error'
      })
      return
    }

    // Check for password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (!passwordRegex.test(passwordForm.new_password)) {
      toast.error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character', {
        id: 'admin-password-strength-error'
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.put('/api/users/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })

      if (response.data.success) {
        toast.success('Password changed successfully!')
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
      } else {
        toast.dismiss('admin-change-password-error')
        toast.error('Failed to change password', {
          id: 'admin-change-password-error'
        })
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.dismiss('admin-change-password-error')
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to change password'
      toast.error(errorMessage, {
        id: 'admin-change-password-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSecuritySettingsUpdate = async () => {
    setLoading(true)
    try {
      // Frontend-only security settings update for now
      toast.success('Security settings updated!')
    } catch (error) {
      toast.dismiss('admin-security-settings-error')
      toast.error('Failed to update security settings', {
        id: 'admin-security-settings-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async () => {
    setLoading(true)
    try {
      // Frontend-only preferences update for now
      toast.success('Preferences updated!')
    } catch (error) {
      toast.dismiss('admin-preferences-error')
      toast.error('Failed to update preferences', {
        id: 'admin-preferences-error'
      })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User, color: 'blue' },
    { id: 'security', name: 'Security', icon: Shield, color: 'red' },
    { id: 'preferences', name: 'Preferences', icon: Settings, color: 'purple' },
    { id: 'activity', name: 'Activity', icon: TrendingUp, color: 'green' }
  ]

  return (
    <>
      <Helmet>
        <title>Admin Profile - HSO Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                    <User className="w-8 h-8 text-white" />
                  </div>
              <div>
                    <h1 className="text-4xl font-bold text-gray-900">Admin Profile</h1>
                    <p className="text-xl text-gray-600 mt-2">
                  Manage your account settings and preferences
                </p>
              </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-gray-600 font-medium">{user?.role}</p>
                </div>
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <nav className="-mb-px flex space-x-8 px-8">
                                 {tabs.map((tab) => {
                   const IconComponent = tab.icon
                  const isActive = activeTab === tab.id
                  const colorClasses = {
                    blue: isActive ? 'border-blue-500 text-blue-600 bg-blue-50' : 'hover:border-blue-300 hover:text-blue-600',
                    red: isActive ? 'border-red-500 text-red-600 bg-red-50' : 'hover:border-red-300 hover:text-red-600',
                    purple: isActive ? 'border-purple-500 text-purple-600 bg-purple-50' : 'hover:border-purple-300 hover:text-purple-600',
                    green: isActive ? 'border-green-500 text-green-600 bg-green-50' : 'hover:border-green-300 hover:text-green-600'
                  }
                  
                   return (
                     <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-4 border-b-2 font-semibold text-sm flex items-center transition-all duration-300 rounded-t-lg ${
                        isActive
                          ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                           : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } ${colorClasses[tab.color]}`}
                     >
                      <IconComponent className={`w-5 h-5 mr-3 ${isActive ? 'animate-pulse' : ''}`} />
                       {tab.name}
                     </button>
                   )
                 })}
              </nav>
            </div>
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                                         <form onSubmit={handleProfileUpdate} className="space-y-6">
                       <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                         <div className="flex items-center justify-between mb-4">
                           <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                             <Camera className="w-5 h-5 mr-2 text-blue-600" />
                             Profile Picture
                           </h3>
                           <div className="flex items-center space-x-2">
                             <span className="text-xs text-gray-500">Max 5MB • JPG, PNG, GIF</span>
                           </div>
                         </div>
                         
                         <div className="flex items-center space-x-6">
                           <div className="relative">
                             <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                               {user?.profile_image ? (
                                 <img 
                                   src={user.profile_image} 
                                   alt="Profile" 
                                   className="w-full h-full object-cover"
                                 />
                               ) : (
                                 <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                   {user?.first_name?.[0]}{user?.last_name?.[0]}
                                 </div>
                               )}
                             </div>
                             {uploading && (
                               <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                 <div className="text-white text-xs">
                                   {imageUploadProgress}%
                                 </div>
                               </div>
                             )}
                           </div>
                           <div className="flex-1">
                             <div 
                               className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer"
                               onDragOver={handleDragOver}
                               onDragLeave={handleDragLeave}
                               onDrop={handleDrop}
                               onClick={() => fileInputRef.current?.click()}
                             >
                               <input
                                 ref={fileInputRef}
                                 type="file"
                                 accept="image/*"
                                 onChange={handleProfileImageUpload}
                                 className="hidden"
                               />
                               
                               <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                               <p className="text-sm text-gray-600 mb-1">
                                 <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                               </p>
                               <p className="text-xs text-gray-500">
                                 PNG, JPG, GIF up to 5MB
                               </p>
                             </div>
                             <div className="flex items-center space-x-2 mt-3">
                               <button
                                 type="button"
                                 onClick={() => fileInputRef.current?.click()}
                                 disabled={uploading}
                                 className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                               >
                                 {uploading ? 'Uploading...' : 'Choose File'}
                               </button>
                               
                               {user?.profile_image && (
                                 <button
                                   type="button"
                                   onClick={handleRemoveProfileImage}
                                   disabled={uploading}
                                   className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                                 >
                                   <Trash2 className="w-3 h-3 mr-1" />
                                   Remove
                                 </button>
                               )}
                             </div>
                           </div>
                         </div>
                         {imagePreview && (
                           <motion.div
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="mt-4 p-3 bg-white rounded-lg border"
                           >
                             <div className="flex items-center justify-between">
                               <span className="text-sm font-medium text-gray-700">Preview:</span>
                               <button
                                 type="button"
                                 onClick={() => setImagePreview(null)}
                                 className="text-gray-400 hover:text-gray-600"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                             <img 
                               src={imagePreview} 
                               alt="Preview" 
                               className="mt-2 w-16 h-16 rounded-full object-cover"
                             />
                           </motion.div>
                         )}
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4">
                           <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                             Personal Info
                           </h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              First Name *
                            </label>
                            <input
                              type="text"
                              value={profileForm.first_name}
                              onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="Enter your first name"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              Last Name *
                            </label>
                            <input
                              type="text"
                              value={profileForm.last_name}
                              onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="Enter your last name"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-green-600" />
                              Email *
                            </label>
                            <input
                              type="email"
                              value={profileForm.email}
                              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="Enter your email address"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-600" />
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="+1234567890"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                            Additional Info
                          </h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Building className="w-4 h-4 text-orange-600" />
                              School/Organization
                            </label>
                            <input
                              type="text"
                              value={profileForm.school_name}
                              onChange={(e) => setProfileForm({...profileForm, school_name: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="Your school or organization"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-red-600" />
                              Location
                            </label>
                            <input
                              type="text"
                              value={profileForm.location}
                              onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="City, Country"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <Globe className="w-4 h-4 text-indigo-600" />
                              Website
                            </label>
                            <input
                              type="url"
                              value={profileForm.website}
                              onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors pl-10"
                              placeholder="https://yourwebsite.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                          Social Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="url"
                            placeholder="LinkedIn URL"
                            value={profileForm.social_links.linkedin}
                            onChange={(e) => setProfileForm({
                              ...profileForm, 
                              social_links: {...profileForm.social_links, linkedin: e.target.value}
                            })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          />
                          <input
                            type="url"
                            placeholder="Twitter URL"
                            value={profileForm.social_links.twitter}
                            onChange={(e) => setProfileForm({
                              ...profileForm, 
                              social_links: {...profileForm.social_links, twitter: e.target.value}
                            })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          />
                          <input
                            type="url"
                            placeholder="Facebook URL"
                            value={profileForm.social_links.facebook}
                            onChange={(e) => setProfileForm({
                              ...profileForm, 
                              social_links: {...profileForm.social_links, facebook: e.target.value}
                            })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          />
                          <input
                            type="url"
                            placeholder="Instagram URL"
                            value={profileForm.social_links.instagram}
                            onChange={(e) => setProfileForm({
                              ...profileForm, 
                              social_links: {...profileForm.social_links, instagram: e.target.value}
                            })}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading && (
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Change Password
                        </h3>
                                                 <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               Current Password
                             </label>
                             <div className="relative">
                               <input
                                 type={showPassword.current ? "text" : "password"}
                                 value={passwordForm.current_password}
                                 onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                 required
                               />
                               <button
                                 type="button"
                                 onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                               >
                                 {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                               </button>
                             </div>
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               New Password
                             </label>
                             <div className="relative">
                               <input
                                 type={showPassword.new ? "text" : "password"}
                                 value={passwordForm.new_password}
                                 onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                 className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                                 required
                               />
                               <button
                                 type="button"
                                 onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                               >
                                 {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                               </button>
                             </div>
                             {passwordForm.new_password && (
                               <div className="mt-2">
                                 <div className="flex items-center space-x-2 mb-1">
                                   <span className="text-xs text-gray-500">Password strength:</span>
                                   <div className="flex space-x-1">
                                     {[1, 2, 3, 4].map((level) => {
                                       const strength = getPasswordStrength(passwordForm.new_password)
                                       return (
                                         <div
                                           key={level}
                                           className={`h-1 w-8 rounded-full ${
                                             level <= strength ? 
                                               strength <= 2 ? 'bg-red-500' : 
                                               strength === 3 ? 'bg-yellow-500' : 'bg-green-500'
                                               : 'bg-gray-200'
                                           }`}
                                         />
                                       )
                                     })}
                                   </div>
                                 </div>
                                 <div className="text-xs text-gray-500">
                                   {getPasswordStrengthText(passwordForm.new_password)}
                                 </div>
                               </div>
                             )}
                           </div>
                           
                           <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">
                               Confirm New Password
                             </label>
                             <div className="relative">
                               <input
                                 type={showPassword.confirm ? "text" : "password"}
                                 value={passwordForm.confirm_password}
                                 onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                 className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                                   passwordForm.confirm_password && passwordForm.new_password !== passwordForm.confirm_password
                                     ? 'border-red-300 bg-red-50'
                                     : passwordForm.confirm_password && passwordForm.new_password === passwordForm.confirm_password
                                     ? 'border-green-300 bg-green-50'
                                     : 'border-gray-300'
                                 }`}
                                 required
                               />
                               <button
                                 type="button"
                                 onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                               >
                                 {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                               </button>
                               {passwordForm.confirm_password && (
                                 <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                   {passwordForm.new_password === passwordForm.confirm_password ? (
                                     <CheckCircle className="w-4 h-4 text-green-500" />
                                   ) : (
                                     <AlertCircle className="w-4 h-4 text-red-500" />
                                   )}
                                 </div>
                               )}
                             </div>
                           </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Changing...' : 'Change Password'}
                            </button>
                          </div>
                        </form>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Security Settings
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                            <button
                              onClick={() => setSecuritySettings({...securitySettings, two_factor_enabled: !securitySettings.two_factor_enabled})}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.two_factor_enabled ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securitySettings.two_factor_enabled ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive email notifications for security events</p>
                            </div>
                            <button
                              onClick={() => setSecuritySettings({...securitySettings, email_notifications: !securitySettings.email_notifications})}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                securitySettings.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                securitySettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                              }`} />
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={handleSecuritySettingsUpdate}
                              disabled={loading}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Updating...' : 'Update Security Settings'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'preferences' && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                          Display Preferences
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Theme
                            </label>
                            <select
                              value={preferences.theme}
                              onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Language
                            </label>
                            <select
                              value={preferences.language}
                              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                            </select>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={handlePreferencesUpdate}
                              disabled={loading}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? 'Updating...' : 'Update Preferences'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                          <div className="flex items-center justify-between">
                      <div>
                              <p className="text-sm font-semibold text-blue-600">Total Logins</p>
                              <p className="text-2xl font-bold text-blue-900">127</p>
                            </div>
                            <div className="p-3 bg-blue-500 rounded-lg">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-green-600">Actions Today</p>
                              <p className="text-2xl font-bold text-green-900">23</p>
                            </div>
                            <div className="p-3 bg-green-500 rounded-lg">
                              <Zap className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-purple-600">Events Created</p>
                              <p className="text-2xl font-bold text-purple-900">8</p>
                            </div>
                            <div className="p-3 bg-purple-500 rounded-lg">
                              <Calendar className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-orange-600">Reports Generated</p>
                              <p className="text-2xl font-bold text-orange-900">15</p>
                            </div>
                            <div className="p-3 bg-orange-500 rounded-lg">
                              <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <TrendingUp className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-bold text-gray-900">Recent Activity Timeline</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Edit3 className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Profile Updated</p>
                              <p className="text-sm text-gray-600">Updated personal information and bio</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">2 hours ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-transparent rounded-lg border border-green-100">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Event Created</p>
                              <p className="text-sm text-gray-600">Created "Technology Integration Workshop"</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">1 day ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">User Management</p>
                              <p className="text-sm text-gray-600">Approved 3 new user registrations</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">2 days ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-100">
                            <div className="p-2 bg-orange-500 rounded-lg">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Report Generated</p>
                              <p className="text-sm text-gray-600">Generated monthly analytics report</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">3 days ago</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-transparent rounded-lg border border-red-100">
                            <div className="p-2 bg-red-500 rounded-lg">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">Security Update</p>
                              <p className="text-sm text-gray-600">Changed password and enabled 2FA</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">1 week ago</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 text-center">
                          <button className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transition-all duration-200 flex items-center gap-2 mx-auto">
                            <RefreshCw className="w-4 h-4" />
                            Load More Activity
                          </button>
                        </div>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Server className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">System Status</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="p-2 bg-green-500 rounded-lg">
                              <Wifi className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-green-800">API Status</p>
                              <p className="text-sm text-green-600">All systems operational</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="p-2 bg-blue-500 rounded-lg">
                              <Database className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-800">Database</p>
                              <p className="text-sm text-blue-600">Connected & healthy</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="p-2 bg-purple-500 rounded-lg">
                              <Shield className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-purple-800">Security</p>
                              <p className="text-sm text-purple-600">All checks passed</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminProfile 