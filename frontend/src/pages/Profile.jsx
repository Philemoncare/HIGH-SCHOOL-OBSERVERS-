import { Helmet } from 'react-helmet-async'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'
import RealIcon from '../components/RealIcon'

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: '👤' },
  { key: 'security', label: 'Security', icon: '🔒' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
  { key: 'privacy', label: 'Privacy', icon: '🛡️' },
  { key: 'activity', label: 'Activity', icon: '🕒' },
  { key: 'account', label: 'Account', icon: '⚙️' },
];

function Profile() {
  // Prefer AuthContext but fall back to localStorage
  const { user: ctxUser, updateUser: ctxUpdateUser, isAuthenticated: ctxAuthenticated, loading: authLoading } = useAuth()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  
  useEffect(() => {
    // If context has a user, use it
    if (ctxUser) {
      setUser(ctxUser)
      setIsAuthenticated(true)
      setLoading(false)
      return
    }
    // Otherwise try localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [ctxUser])
  
  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    try { localStorage.setItem('user', JSON.stringify(updatedUser)) } catch (_) {}
    if (ctxUpdateUser) ctxUpdateUser(updatedUser)
  }
  
  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/')
  }
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      toast.dismiss('profile-auth-error')
      toast.error('Please log in to access your profile', {
        id: 'profile-auth-error'
      })
      navigate('/login', { replace: true })
    }
  }, [loading, isAuthenticated, navigate])

  // Note: Do NOT early-return before all hooks are declared. We'll handle loading/unauthenticated in render below.

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    school_name: user?.school_name || '',
    profile_image: user?.profile_image || '',
  })
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [showSocialEdit, setShowSocialEdit] = useState(false)
  const [socialLinks, setSocialLinks] = useState(user?.social_links || {})
  const [badges, setBadges] = useState(user?.badges || [])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [notificationPrefs, setNotificationPrefs] = useState({
    newsletter: user?.notificationPrefs?.newsletter ?? true,
    eventReminders: user?.notificationPrefs?.eventReminders ?? true,
    activityAlerts: user?.notificationPrefs?.activityAlerts ?? true,
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [privacyPrefs, setPrivacyPrefs] = useState({
    profileVisible: user?.privacyPrefs?.profileVisible ?? true,
    showEmail: user?.privacyPrefs?.showEmail ?? false,
    allowContact: user?.privacyPrefs?.allowContact ?? true,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFAEnabled || false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [socialLoading, setSocialLoading] = useState('');
  const [widgets, setWidgets] = useState({
    quickLinks: true,
    stats: true,
    news: true,
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'base');
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize === 'lg' ? '18px' : fontSize === 'sm' ? '14px' : '16px';
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('contrast');
    } else {
      document.documentElement.classList.remove('contrast');
    }
    localStorage.setItem('highContrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (user && user._id) {
      // Fetch recent activity from backend if available
      axios.get(`/api/users/${user._id}/activity`).then(res => {
        setRecentActivity(res.data.activity || [])
      }).catch(() => {
        // fallback to mock if endpoint not available
        setRecentActivity([
          { id: 1, text: 'Logged in', time: '2 hours ago' },
          { id: 2, text: 'Updated profile', time: '1 day ago' },
          { id: 3, text: 'Registered for STEM Workshop', time: '3 days ago' },
        ])
      }).finally(() => setActivityLoading(false))
    }
  }, [user])

  useEffect(() => {
    if (user && user.notificationPrefs) {
      setNotificationPrefs({
        newsletter: user.notificationPrefs.newsletter ?? true,
        eventReminders: user.notificationPrefs.eventReminders ?? true,
        activityAlerts: user.notificationPrefs.activityAlerts ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.privacyPrefs) {
      setPrivacyPrefs({
        profileVisible: user.privacyPrefs.profileVisible ?? true,
        showEmail: user.privacyPrefs.showEmail ?? false,
        allowContact: user.privacyPrefs.allowContact ?? true,
      });
    }
  }, [user]);

  useEffect(() => {
    setTwoFAEnabled(user?.twoFAEnabled || false);
  }, [user]);

  // Fetch sessions when Account section is active
  useEffect(() => {
    if (activeSection === 'account' && user && user._id) {
      setSessionsLoading(true);
      axios.get(`/api/users/${user._id}/sessions`).then(res => {
        setSessions(res.data.sessions || []);
      }).catch(() => {
        setSessions([]);
      }).finally(() => setSessionsLoading(false));
    }
  }, [activeSection, user]);

  const handleRevokeSession = async (token) => {
    setRevokeLoading(token);
    try {
      await axios.delete(`/api/users/${user._id}/sessions/${token}`);
      setSessions(sessions.filter(s => s.token !== token));
      toast.success('Session revoked.');
    } catch {
      toast.dismiss('revoke-session-error')
      toast.error('Failed to revoke session.', {
        id: 'revoke-session-error'
      })
    } finally {
      setRevokeLoading('');
    }
  };

  const handleAvatarClick = () => {
    if (editMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      // Convert file to base64 for immediate preview and backend update
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update UI immediately
      setForm(f => ({ ...f, profile_image: base64 }));

      // Try to persist to backend; fall back to local only if it fails
      if (user?._id) {
        try {
          const res = await axios.put(`/api/users/${user._id}`, { profile_image: base64 });
          updateUser(res.data.user || { ...user, profile_image: base64 });
          toast.success('Profile picture updated');
        } catch {
          // Save locally and keep it persistent across sessions
          updateUser({ ...user, profile_image: base64 });
          toast.success('Profile picture updated locally');
        }
      }
    } catch (err) {
      toast.dismiss('process-image-error')
      toast.error('Failed to process image', {
        id: 'process-image-error'
      })
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSave = async e => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await axios.put(`/api/users/${user._id}`, form)
      updateUser(res.data.user)
      setEditMode(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.dismiss('update-profile-error')
      toast.error('Failed to update profile', {
        id: 'update-profile-error'
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async e => {
    e.preventDefault()
    setPwLoading(true)
    if (passwords.new !== passwords.confirm) {
      toast.dismiss('password-match-error')
      toast.error('Passwords do not match', {
        id: 'password-match-error'
      })
      setPwLoading(false)
      return
    }
    try {
      await axios.put(`/api/users/${user._id}/password`, {
        current_password: passwords.current,
        new_password: passwords.new
      })
      setShowPasswordModal(false)
      setPasswords({ current: '', new: '', confirm: '' })
      toast.success('Password changed!')
    } catch (err) {
      toast.dismiss('change-password-error')
      toast.error('Failed to change password', {
        id: 'change-password-error'
      })
    } finally {
      setPwLoading(false)
    }
  }

  const handleSocialChange = e => {
    const { name, value } = e.target
    setSocialLinks(s => ({ ...s, [name]: value }))
  }

  const handleSaveSocial = async e => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await axios.put(`/api/users/${user._id}`, { social_links: socialLinks })
      updateUser(res.data.user)
      setShowSocialEdit(false)
      toast.success('Social links updated!')
    } catch (err) {
      toast.dismiss('update-social-error')
      toast.error('Failed to update social links', {
        id: 'update-social-error'
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleNotifChange = e => {
    const { name, checked } = e.target;
    setNotificationPrefs(p => ({ ...p, [name]: checked }));
  };

  const handleSaveNotif = async e => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      const res = await axios.put(`/api/users/${user._id}`, { notificationPrefs });
      updateUser(res.data.user);
      toast.success('Notification preferences updated!');
    } catch (err) {
      toast.dismiss('update-notif-error')
      toast.error('Failed to update notification preferences', {
        id: 'update-notif-error'
      })
    } finally {
      setNotifLoading(false);
    }
  };

  const handlePrivacyChange = e => {
    const { name, checked } = e.target;
    setPrivacyPrefs(p => ({ ...p, [name]: checked }));
  };

  const handleSavePrivacy = async e => {
    e.preventDefault();
    setPrivacyLoading(true);
    try {
      const res = await axios.put(`/api/users/${user._id}`, { privacyPrefs });
      updateUser(res.data.user);
      toast.success('Privacy settings updated!');
    } catch (err) {
      toast.dismiss('update-privacy-error')
      toast.error('Failed to update privacy settings', {
        id: 'update-privacy-error'
      })
    } finally {
      setPrivacyLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      await axios.post(`/api/users/${user._id}/2fa/send-code`);
      setShow2FAModal(true);
    } catch (err) {
      setTwoFAError('Failed to send verification code.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const res = await axios.post(`/api/users/${user._id}/2fa/verify`, { code: twoFACode });
      updateUser(res.data.user);
      setTwoFAEnabled(true);
      setShow2FAModal(false);
      setTwoFACode('');
      toast.success('Two-factor authentication enabled!');
    } catch (err) {
      setTwoFAError('Invalid or expired code.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const res = await axios.post(`/api/users/${user._id}/2fa/disable`);
      updateUser(res.data.user);
      setTwoFAEnabled(false);
      toast.success('Two-factor authentication disabled.');
    } catch (err) {
      setTwoFAError('Failed to disable 2FA.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloadLoading(true);
    try {
      const res = await axios.get(`/api/users/${user._id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hso-profile-export.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Data export started!');
    } catch {
      toast.dismiss('export-data-error')
      toast.error('Failed to export data', {
        id: 'export-data-error'
      })
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await axios.post(`/api/users/${user._id}/delete`, { password: deletePassword });
      toast.success('Account deleted.');
      setShowDeleteModal(false);
      logout();
      window.location.href = '/';
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
      setDeletePassword('');
    }
  };

  const handleConnectSocial = async (provider) => {
    setSocialLoading(provider);
    try {
      const res = await axios.post(`/api/users/${user._id}/connect/${provider}`);
      updateUser(res.data.user);
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected!`);
    } catch {
      toast.dismiss(`connect-${provider}-error`)
      toast.error(`Failed to connect ${provider}`, {
        id: `connect-${provider}-error`
      })
    } finally {
      setSocialLoading('');
    }
  };

  const handleDisconnectSocial = async (provider) => {
    setSocialLoading(provider);
    try {
      const res = await axios.post(`/api/users/${user._id}/disconnect/${provider}`);
      updateUser(res.data.user);
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected!`);
    } catch {
      toast.dismiss(`disconnect-${provider}-error`)
      toast.error(`Failed to disconnect ${provider}`, {
        id: `disconnect-${provider}-error`
      })
    } finally {
      setSocialLoading('');
    }
  };

  const handleToggleWidget = (key) => {
    setWidgets(w => ({ ...w, [key]: !w[key] }));
    toast.success(`${key.replace(/([A-Z])/g, ' $1')} ${widgets[key] ? 'hidden' : 'shown'}`);
  };

  return (
    <>
      <Helmet>
        <title>Profile - High School Observer</title>
      </Helmet>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      ) : (!isAuthenticated || !user) ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <RealIcon
                symbol="🔒"
                badge
                className="w-8 h-8"
                colorClassName="text-white"
                badgeClassName="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 shadow-xl shadow-red-500/30 flex items-center justify-center"
                title="Locked"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <button 
              onClick={() => navigate('/login')}
              className="bg-red-800 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 flex flex-col items-center">
        <div className="w-full max-w-5xl flex gap-8 px-4">
          <aside className="w-60 hidden md:block flex-shrink-0">
            <nav className="bg-white/95 backdrop-blur rounded-2xl shadow p-6 border border-gray-100 sticky top-24">
              <ul className="space-y-1">
                {SECTIONS.map(section => (
                  <li key={section.key}>
                    <button
                      className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg font-medium transition text-left ${activeSection === section.key ? 'bg-red-50 text-red-800 ring-1 ring-red-100' : 'hover:bg-gray-50 text-gray-700'}`}
                      onClick={() => setActiveSection(section.key)}
                    >
                      <span className="inline-flex items-center justify-center">
                        <RealIcon symbol={section.icon} className="w-4 h-4" colorClassName="text-current" title={section.label} />
                      </span>
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow p-6 border border-gray-100">
              {activeSection === 'overview' && (
                <div>
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center text-4xl font-bold text-red-800 relative shadow border-4 border-white -mt-16 mb-2" aria-label="User initials" onClick={handleAvatarClick} style={{ position: 'relative', cursor: editMode ? 'pointer' : 'default' }}>
                      {form.profile_image ? (
                        <img src={form.profile_image} alt="Avatar" className="w-28 h-28 rounded-full object-cover" />
                      ) : (
                        <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
                      )}
                      {editMode && (
                        <span className="absolute bottom-1 right-1 bg-white border border-gray-300 rounded-full px-2 py-0.5 text-xs shadow">Change</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                        disabled={avatarUploading}
                      />
                      {avatarUploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-full">
                          <svg className="animate-spin h-8 w-8 text-red-800" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-extrabold text-red-800 mt-1" aria-label="User name">{user?.first_name} {user?.last_name}</h1>
                    <p className="text-gray-600 text-sm" aria-label="User email">{user?.email}</p>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{user?.role?.replace('_', ' ')}</p>
                    <p className="text-gray-500 text-xs">{user?.school_name}</p>
                    <div className="flex gap-2 mt-2">
                      {badges && badges.length > 0 && badges.map((badge, i) => (
                        <span key={i} className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">{badge}</span>
                      ))}
                    </div>
                    <div className="mt-3">
                      <button className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm" onClick={()=>setEditMode(e=>!e)}>{editMode ? 'Cancel Edit' : 'Edit Profile'}</button>
                    </div>
                  </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔗</span> Social Links</h2>
              {showSocialEdit ? (
                <form onSubmit={handleSaveSocial} className="space-y-2">
                  <input name="twitter" value={socialLinks.twitter || ''} onChange={handleSocialChange} placeholder="Twitter URL" className="w-full border rounded px-3 py-2" />
                  <input name="linkedin" value={socialLinks.linkedin || ''} onChange={handleSocialChange} placeholder="LinkedIn URL" className="w-full border rounded px-3 py-2" />
                  <input name="facebook" value={socialLinks.facebook || ''} onChange={handleSocialChange} placeholder="Facebook URL" className="w-full border rounded px-3 py-2" />
                        <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded">Save</button>
                  <button type="button" className="ml-2 px-4 py-2 border rounded" onClick={()=>setShowSocialEdit(false)}>Cancel</button>
                </form>
              ) : (
                <div className="flex flex-col gap-1">
                  {socialLinks.twitter && <a href={socialLinks.twitter} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">Twitter</a>}
                  {socialLinks.linkedin && <a href={socialLinks.linkedin} className="text-blue-700 hover:underline" target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                  {socialLinks.facebook && <a href={socialLinks.facebook} className="text-blue-800 hover:underline" target="_blank" rel="noopener noreferrer">Facebook</a>}
                  <button className="mt-2 px-3 py-1 border rounded text-sm" onClick={()=>setShowSocialEdit(true)}>Edit Social Links</button>
                </div>
              )}
            </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔔</span> Notification Preferences</h2>
                    <form onSubmit={handleSaveNotif} className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="newsletter" checked={notificationPrefs.newsletter} onChange={handleNotifChange} />
                        Receive newsletter emails
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="eventReminders" checked={notificationPrefs.eventReminders} onChange={handleNotifChange} />
                        Event reminders
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="activityAlerts" checked={notificationPrefs.activityAlerts} onChange={handleNotifChange} />
                        Activity alerts (e.g., comments, mentions)
                      </label>
                      <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded" disabled={notifLoading}>{notifLoading ? 'Saving...' : 'Save Preferences'}</button>
                    </form>
                  </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🛡️</span> Privacy Controls</h2>
                    <form onSubmit={handleSavePrivacy} className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="profileVisible" checked={privacyPrefs.profileVisible} onChange={handlePrivacyChange} />
                        Make my profile public (visible to others)
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="showEmail" checked={privacyPrefs.showEmail} onChange={handlePrivacyChange} />
                        Show my email on my profile
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" name="allowContact" checked={privacyPrefs.allowContact} onChange={handlePrivacyChange} />
                        Allow other users to contact me
                      </label>
                      <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded" disabled={privacyLoading}>{privacyLoading ? 'Saving...' : 'Save Privacy Settings'}</button>
                    </form>
                  </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔒</span> Two-Factor Authentication</h2>
                    <div className="flex items-center gap-4">
                      <span className={`font-medium ${twoFAEnabled ? 'text-green-600' : 'text-gray-600'}`}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                      {twoFAEnabled ? (
                        <button onClick={handleDisable2FA} className="px-4 py-2 border rounded text-red-700 border-red-700 hover:bg-red-50 transition" disabled={twoFALoading}>{twoFALoading ? 'Disabling...' : 'Disable 2FA'}</button>
                      ) : (
                        <button onClick={handleEnable2FA} className="px-4 py-2 border rounded text-red-800 border-red-800 hover:bg-red-50 transition" disabled={twoFALoading}>{twoFALoading ? 'Sending...' : 'Enable 2FA'}</button>
                      )}
                    </div>
                    {twoFAError && <div className="text-red-700 mt-2">{twoFAError}</div>}
                    {show2FAModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                          <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setShow2FAModal(false)} aria-label="Close">&times;</button>
                          <h2 className="text-xl font-bold mb-4 text-red-800">Verify Your Email</h2>
                          <p className="mb-2 text-gray-700">A verification code has been sent to your email. Enter it below to enable two-factor authentication.</p>
                          <form onSubmit={handleVerify2FA} className="space-y-4">
                            <input type="text" value={twoFACode} onChange={e=>setTwoFACode(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter verification code" required />
                            <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded w-full" disabled={twoFALoading}>{twoFALoading ? 'Verifying...' : 'Verify & Enable 2FA'}</button>
                          </form>
                          {twoFAError && <div className="text-red-700 mt-2">{twoFAError}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>✅</span> Profile Status</h2>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><b>Verified:</b> {user?.is_verified ? 'Yes' : 'No'}</li>
                <li><b>Approved:</b> {user?.is_approved ? 'Yes' : 'No'}</li>
              </ul>
            </div>
                  <hr className="my-6 border-red-100" />
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🕒</span> Recent Activity</h2>
              {activityLoading ? (
                <div>Loading...</div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-gray-500">No recent activity.</div>
              ) : (
                      <ul className="space-y-3">
                  {recentActivity.map(a => (
                          <li key={a.id} className="flex items-start gap-3">
                            <span className="mt-1">
                              {a.type === 'login' && <span title="Login">🔑</span>}
                              {a.type === 'event' && <span title="Event">📅</span>}
                              {a.type === 'news' && <span title="News">📰</span>}
                              {a.type === 'profile' && <span title="Profile">👤</span>}
                              {a.type === 'comment' && <span title="Comment">💬</span>}
                              {!a.type && <span>•</span>}
                            </span>
                            <div>
                              {a.link ? (
                                <a href={a.link} className="text-red-800 hover:underline" target="_blank" rel="noopener noreferrer">{a.text}</a>
                              ) : (
                                <span>{a.text}</span>
                              )}
                              <div className="text-xs text-gray-400">{a.time}</div>
                            </div>
                          </li>
                  ))}
                </ul>
              )}
            </div>
                  <div className="flex gap-2 mt-8">
                    <button className="px-4 py-2 bg-red-800 text-white rounded font-semibold" onClick={()=>setEditMode(e=>!e)}>{editMode ? 'Cancel Edit' : 'Edit Profile'}</button>
                    <button className="px-4 py-2 border border-red-800 text-red-800 rounded font-semibold" onClick={()=>setShowPasswordModal(true)}>Change Password</button>
            </div>
            {editMode && (
              <form onSubmit={handleSave} className="space-y-4 mt-4" aria-label="Edit profile form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">First Name</label>
                    <input name="first_name" value={form.first_name} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!editMode} aria-label="First name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Last Name</label>
                    <input name="last_name" value={form.last_name} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!editMode} aria-label="Last name" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Email</label>
                    <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled aria-label="Email" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!editMode} aria-label="Phone" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium">School Name</label>
                    <input name="school_name" value={form.school_name} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!editMode} aria-label="School name" />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save Changes</button>
              </form>
            )}
            {showPasswordModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                  <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setShowPasswordModal(false)} aria-label="Close">&times;</button>
                  <h2 className="text-xl font-bold mb-4">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Current Password</label>
                      <input type="password" name="current" value={passwords.current} onChange={e=>setPasswords(p=>({...p,current:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">New Password</label>
                      <input type="password" name="new" value={passwords.new} onChange={e=>setPasswords(p=>({...p,new:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Confirm New Password</label>
                      <input type="password" name="confirm" value={passwords.confirm} onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
                  </form>
                </div>
              </div>
            )}
          </div>
              )}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔒</span> Two-Factor Authentication</h2>
                  <div className="flex items-center gap-4">
                    <span className={`font-medium ${twoFAEnabled ? 'text-green-600' : 'text-gray-600'}`}>{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                    {twoFAEnabled ? (
                      <button onClick={handleDisable2FA} className="px-4 py-2 border rounded text-red-700 border-red-700 hover:bg-red-50 transition" disabled={twoFALoading}>{twoFALoading ? 'Disabling...' : 'Disable 2FA'}</button>
                    ) : (
                      <button onClick={handleEnable2FA} className="px-4 py-2 border rounded text-red-800 border-red-800 hover:bg-red-50 transition" disabled={twoFALoading}>{twoFALoading ? 'Sending...' : 'Enable 2FA'}</button>
                    )}
                  </div>
                  {twoFAError && <div className="text-red-700 mt-2">{twoFAError}</div>}
                  {show2FAModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setShow2FAModal(false)} aria-label="Close">&times;</button>
                        <h2 className="text-xl font-bold mb-4 text-red-800">Verify Your Email</h2>
                        <p className="mb-2 text-gray-700">A verification code has been sent to your email. Enter it below to enable two-factor authentication.</p>
                        <form onSubmit={handleVerify2FA} className="space-y-4">
                          <input type="text" value={twoFACode} onChange={e=>setTwoFACode(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter verification code" required />
                          <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded w-full" disabled={twoFALoading}>{twoFALoading ? 'Verifying...' : 'Verify & Enable 2FA'}</button>
                        </form>
                        {twoFAError && <div className="text-red-700 mt-2">{twoFAError}</div>}
                      </div>
                    </div>
                  )}
                  <hr className="my-6 border-red-100" />
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔑</span> Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">Current Password</label>
                      <input type="password" name="current" value={passwords.current} onChange={e=>setPasswords(p=>({...p,current:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">New Password</label>
                      <input type="password" name="new" value={passwords.new} onChange={e=>setPasswords(p=>({...p,new:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Confirm New Password</label>
                      <input type="password" name="confirm" value={passwords.confirm} onChange={e=>setPasswords(p=>({...p,confirm:e.target.value}))} className="w-full border rounded px-3 py-2" required />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={pwLoading}>{pwLoading ? 'Changing...' : 'Change Password'}</button>
                  </form>
                </div>
              )}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🔔</span> Notification Preferences</h2>
                  <form onSubmit={handleSaveNotif} className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="newsletter" checked={notificationPrefs.newsletter} onChange={handleNotifChange} />
                      Receive newsletter emails
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="eventReminders" checked={notificationPrefs.eventReminders} onChange={handleNotifChange} />
                      Event reminders
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="activityAlerts" checked={notificationPrefs.activityAlerts} onChange={handleNotifChange} />
                      Activity alerts (e.g., comments, mentions)
                    </label>
                    <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded" disabled={notifLoading}>{notifLoading ? 'Saving...' : 'Save Preferences'}</button>
                  </form>
                </div>
              )}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🛡️</span> Privacy Controls</h2>
                  <form onSubmit={handleSavePrivacy} className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="profileVisible" checked={privacyPrefs.profileVisible} onChange={handlePrivacyChange} />
                      Make my profile public (visible to others)
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="showEmail" checked={privacyPrefs.showEmail} onChange={handlePrivacyChange} />
                      Show my email on my profile
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="allowContact" checked={privacyPrefs.allowContact} onChange={handlePrivacyChange} />
                      Allow other users to contact me
                    </label>
                    <button type="submit" className="bg-red-800 text-white px-4 py-2 rounded" disabled={privacyLoading}>{privacyLoading ? 'Saving...' : 'Save Privacy Settings'}</button>
                  </form>
                </div>
              )}
              {activeSection === 'activity' && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>🕒</span> Recent Activity</h2>
                  {activityLoading ? (
                    <div>Loading...</div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-gray-500">No recent activity.</div>
                  ) : (
                    <ul className="space-y-3">
                      {recentActivity.map(a => (
                        <li key={a.id} className="flex items-start gap-3">
                          <span className="mt-1">
                            {a.type === 'login' && <span title="Login">🔑</span>}
                            {a.type === 'event' && <span title="Event">📅</span>}
                            {a.type === 'news' && <span title="News">📰</span>}
                            {a.type === 'profile' && <span title="Profile">👤</span>}
                            {a.type === 'comment' && <span title="Comment">💬</span>}
                            {!a.type && <span>•</span>}
                          </span>
                          <div>
                            {a.link ? (
                              <a href={a.link} className="text-red-800 hover:underline" target="_blank" rel="noopener noreferrer">{a.text}</a>
                            ) : (
                              <span>{a.text}</span>
                            )}
                            <div className="text-xs text-gray-400">{a.time}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeSection === 'account' && (
                <div>
                  <h2 className="text-lg font-bold mb-2 text-red-800 flex items-center gap-2"><span>⚙️</span> Account Settings</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Active Sessions</h3>
                      {sessionsLoading ? (
                        <div>Loading sessions...</div>
                      ) : sessions.length === 0 ? (
                        <div className="text-gray-500">No active sessions found.</div>
                      ) : (
                        <ul className="divide-y divide-red-100">
                          {sessions.map((s, i) => (
                            <li key={s.token} className="flex items-center justify-between py-3">
                              <div>
                                <div className="font-semibold text-gray-800">{s.device || 'Unknown Device'}</div>
                                <div className="text-xs text-gray-500">IP: {s.ip || 'N/A'} | Last Active: {s.lastActive ? new Date(s.lastActive).toLocaleString() : 'N/A'}</div>
                              </div>
                              <button
                                className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition"
                                onClick={() => handleRevokeSession(s.token)}
                                disabled={revokeLoading === s.token}
                              >
                                {revokeLoading === s.token ? 'Logging out...' : 'Log out'}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Download My Data</h3>
                      <p className="text-sm text-gray-700">Export your personal data, including profile information, activity history, and settings.</p>
                      <button onClick={handleDownloadData} className="mt-2 px-4 py-2 border border-red-800 text-red-800 rounded font-semibold" disabled={downloadLoading}>
                        {downloadLoading ? 'Preparing...' : 'Download Data'}
                      </button>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Account Deletion/Deactivation</h3>
                      <p className="text-sm text-gray-700">Permanently delete your account and all associated data. This action cannot be undone.</p>
                      <button onClick={()=>setShowDeleteModal(true)} className="mt-2 px-4 py-2 border border-red-800 text-red-800 rounded font-semibold">Delete Account</button>
                      {showDeleteModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                            <button className="absolute top-2 right-2 text-gray-500" onClick={()=>setShowDeleteModal(false)} aria-label="Close">&times;</button>
                            <h2 className="text-xl font-bold mb-4 text-red-800">Confirm Account Deletion</h2>
                            <p className="mb-2 text-gray-700">This action is irreversible. Please enter your password to confirm.</p>
                            <form onSubmit={handleDeleteAccount} className="space-y-4">
                              <input type="password" value={deletePassword} onChange={e=>setDeletePassword(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter your password" required />
                              <button type="submit" className="px-4 py-2 bg-red-800 text-white rounded w-full" disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete My Account'}</button>
                            </form>
                            {deleteError && <div className="text-red-700 mt-2">{deleteError}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Connected Accounts</h3>
                      <p className="text-sm text-gray-700">Manage your connections to external services like Google, Facebook, etc.</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-4">
                          <span className="w-24">Google</span>
                          {user?.googleId ? (
                            <>
                              <span className="text-green-700 font-semibold">Connected</span>
                              <button onClick={()=>handleDisconnectSocial('google')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='google'}>
                                {socialLoading==='google' ? 'Disconnecting...' : 'Disconnect'}
                              </button>
                            </>
                          ) : (
                            <button onClick={()=>handleConnectSocial('google')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='google'}>
                              {socialLoading==='google' ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="w-24">Facebook</span>
                          {user?.facebookId ? (
                            <>
                              <span className="text-green-700 font-semibold">Connected</span>
                              <button onClick={()=>handleDisconnectSocial('facebook')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='facebook'}>
                                {socialLoading==='facebook' ? 'Disconnecting...' : 'Disconnect'}
                              </button>
                            </>
                          ) : (
                            <button onClick={()=>handleConnectSocial('facebook')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='facebook'}>
                              {socialLoading==='facebook' ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="w-24">Twitter</span>
                          {user?.twitterId ? (
                            <>
                              <span className="text-green-700 font-semibold">Connected</span>
                              <button onClick={()=>handleDisconnectSocial('twitter')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='twitter'}>
                                {socialLoading==='twitter' ? 'Disconnecting...' : 'Disconnect'}
                              </button>
                            </>
                          ) : (
                            <button onClick={()=>handleConnectSocial('twitter')} className="px-3 py-1 border border-red-800 text-red-800 rounded text-sm font-semibold hover:bg-red-50 transition" disabled={socialLoading==='twitter'}>
                              {socialLoading==='twitter' ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Dashboard Widgets</h3>
                      <p className="text-sm text-gray-700">Personalize your dashboard by toggling widgets on or off.</p>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={widgets.quickLinks} onChange={()=>handleToggleWidget('quickLinks')} />
                          <span className="font-medium">Quick Links</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={widgets.stats} onChange={()=>handleToggleWidget('stats')} />
                          <span className="font-medium">Stats</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={widgets.news} onChange={()=>handleToggleWidget('news')} />
                          <span className="font-medium">News</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-md font-semibold mb-2 text-red-800">Theme & Accessibility</h3>
                      <p className="text-sm text-gray-700">Customize the application's appearance and accessibility options.</p>
                      <div className="flex flex-col gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer group" title="Toggle dark mode">
                          <input type="checkbox" checked={theme === 'dark'} onChange={()=>setTheme(theme === 'dark' ? 'light' : 'dark')} className="sr-only" />
                          <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ${theme==='dark' ? 'bg-red-800' : ''}`}>
                            <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${theme==='dark' ? 'translate-x-4' : ''}`}></span>
                          </span>
                          <span className="ml-2 font-medium">Dark Mode</span>
                        </label>
                        <label className="flex items-center gap-2" title="Adjust font size">
                          <span className="font-medium">Font Size:</span>
                          <select value={fontSize} onChange={e=>setFontSize(e.target.value)} className="border rounded px-2 py-1 focus:ring-2 focus:ring-red-800">
                            <option value="sm">Small</option>
                            <option value="base">Normal</option>
                            <option value="lg">Large</option>
                          </select>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group" title="Toggle high contrast mode">
                          <input type="checkbox" checked={highContrast} onChange={()=>setHighContrast(v=>!v)} className="sr-only" />
                          <span className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ${highContrast ? 'bg-red-800' : ''}`}>
                            <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${highContrast ? 'translate-x-4' : ''}`}></span>
                          </span>
                          <span className="ml-2 font-medium">High Contrast</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      )}
    </>
  )
}

export default Profile 