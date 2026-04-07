import { Helmet } from 'react-helmet-async'
import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import toast from 'react-hot-toast'
import AdminExecTable from '../components/AdminExecTable'
import AdminExecModal from '../components/AdminExecModal'
import { 
  Newspaper, Calendar, DollarSign, CreditCard, Users, 
  TrendingUp, Activity, Shield, Zap, BarChart3,
  FileText, Gift, UserPlus, ShoppingBag, Crown,
  ArrowRight, CheckCircle2, AlertCircle,
  Search, Command, X, Clock, RefreshCw, Sparkles,
  Settings, Download, Database, Server, Wifi, WifiOff
} from 'lucide-react'

function Admin() {
  const [metrics, setMetrics] = useState({ 
    news: 0, 
    events: 0, 
    donations: 0, 
    users: 0,
    payments: 0,
    magazines: 0,
    pendingApprovals: 0,
    unverified: 0,
  })
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState('')
  const [healthHistory, setHealthHistory] = useState([])
  const [search, setSearch] = useState('')
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview | activity | system | settings
  const navigate = useNavigate()
  const { user } = useAdminAuth()
  
  // Settings state
  const [settings, setSettings] = useState({
    allowRegistrations: true,
    maintenanceMode: false,
    supportEmail: 'support@hso.com',
  })
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsJustSaved, setSettingsJustSaved] = useState(false)
  
  // Admin/Exec modal state
  const [execModalOpen, setExecModalOpen] = useState(false)
  const [execModalUser, setExecModalUser] = useState(null)
  const [execModalMode, setExecModalMode] = useState('add')
  
  // Activity/Audit logs state
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [auditSearch, setAuditSearch] = useState('')
  const [auditFilter, setAuditFilter] = useState('all') // all, User, DonationCampaign, etc.

  const displayName = user?.first_name ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Administrator'

  const formatCompact = (n) => {
    const num = Number(n || 0)
    if (Number.isNaN(num)) return '0'
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
    if (num >= 10_000) return `${(num / 1_000).toFixed(1)}K`
    return `${num}`
  }

  const makeSpark = (seed, points = 18) => {
    const base = Math.max(3, Number(seed || 0) + 3)
    const vals = Array.from({ length: points }, (_v, i) => {
      const wave = Math.sin((i / (points - 1)) * Math.PI * 2) * 0.15
      const bump = Math.cos((i / (points - 1)) * Math.PI) * 0.08
      return base * (1 + wave + bump) + (i % 3) * 0.2
    })
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const norm = vals.map(v => (v - min) / (max - min || 1))
    const w = 84
    const h = 28
    const pad = 2
    const toX = (i) => pad + (i * (w - pad * 2)) / (points - 1)
    const toY = (v) => pad + (1 - v) * (h - pad * 2)
    return norm.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(2)} ${toY(v).toFixed(2)}`).join(' ')
  }

  useEffect(() => {
    async function fetchMetrics() {
      try {
        // Fetch metrics for each section
        const [newsRes, eventsRes, donationsRes, usersRes, paymentsRes, magazinesRes] = await Promise.allSettled([
          axios.get('/api/news').catch(() => ({ data: {} })),
          axios.get('/api/events'),
          axios.get('/api/donations'),
          axios.get('/api/users'),
          axios.get('/api/payments/history').catch(() => ({ data: { payments: [] } })),
          axios.get('/api/magazine').catch(() => ({ data: [] }))
        ]);

        const usersList = usersRes.status === 'fulfilled' ? (usersRes.value.data.users || usersRes.value.data || []) : []
        const pendingApprovals = Array.isArray(usersList) ? usersList.filter(u => !u.is_approved).length : 0
        const unverified = Array.isArray(usersList) ? usersList.filter(u => !u.is_verified).length : 0

        const newsCount = newsRes.status === 'fulfilled'
          ? (newsRes.value.data.articles?.length ?? newsRes.value.data.news?.length ?? (Array.isArray(newsRes.value.data) ? newsRes.value.data.length : 0))
          : 0
        const magazinesCount = magazinesRes.status === 'fulfilled'
          ? (Array.isArray(magazinesRes.value.data) ? magazinesRes.value.data.length : (magazinesRes.value.data?.magazines?.length || 0))
          : 0

        setMetrics({
          news: newsCount,
          events: eventsRes.status === 'fulfilled' ? (eventsRes.value.data.events?.length || eventsRes.value.data?.length || 0) : 0,
          donations: donationsRes.status === 'fulfilled' ? (donationsRes.value.data.donations?.length || donationsRes.value.data?.length || 0) : 0,
          users: usersRes.status === 'fulfilled' ? (usersRes.value.data.users?.length || usersRes.value.data?.length || 0) : 0,
          payments: paymentsRes.status === 'fulfilled' ? (paymentsRes.value.data.payments?.length || paymentsRes.value.data?.length || 0) : 0,
          magazines: magazinesCount,
          pendingApprovals,
          unverified,
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setMetrics(m => ({ ...m, news: 0, events: 0, donations: 0, users: 0, payments: 0, magazines: 0, pendingApprovals: 0, unverified: 0 }));
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
    const id = setInterval(fetchMetrics, 30000) // refresh every 30s for a “live” feel
    return () => clearInterval(id)
  }, []);

  useEffect(() => {
    let mounted = true
    const fetchHealth = async () => {
      setHealthLoading(true)
      setHealthError('')
      try {
        const res = await axios.get('/api/health')
        if (mounted) {
          setHealth(res.data)
          setHealthHistory(prev => {
            const next = [{ ts: Date.now(), status: res.data?.database?.connected ? 'online' : 'degraded', detail: res.data?.database?.status || 'unknown' }, ...prev]
            return next.slice(0, 8)
          })
        }
      } catch (e) {
        if (mounted) setHealthError(e?.response?.data?.error || e?.message || 'Failed to load system health')
      } finally {
        if (mounted) setHealthLoading(false)
      }
    }
    fetchHealth()
    const id = setInterval(fetchHealth, 15000)
    return () => {
      mounted = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const isK = (e.key || '').toLowerCase() === 'k'
      if ((e.ctrlKey || e.metaKey) && isK) {
        e.preventDefault()
        setPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fetch audit logs
  useEffect(() => {
    if (activeTab === 'activity') {
      async function fetchAuditLogs() {
        setAuditLoading(true)
        try {
          const res = await axios.get('/api/admin/audit-logs')
          setAuditLogs(res.data.logs || [])
        } catch (err) {
          setAuditLogs([])
        } finally {
          setAuditLoading(false)
        }
      }
      fetchAuditLogs()
    }
  }, [activeTab])

  // Fetch settings when opening Settings tab (real-time from backend)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await axios.get('/api/admin/settings').catch(() => ({ data: null }))
      if (res?.data) {
        setSettings({
          allowRegistrations: !!res.data.allowRegistrations,
          maintenanceMode: !!res.data.maintenanceMode,
          supportEmail: res.data.supportEmail ?? 'support@hso.com',
        })
        return res.data
      }
    } catch (err) {
      console.error('Fetch settings error:', err)
    }
    return null
  }, [])

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings()
    }
  }, [activeTab, fetchSettings])

  // Settings handlers
  const handleSettingsChange = (e) => {
    const { name, type, checked, value } = e.target
    setSettings(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSettingsSave = async (e) => {
    e.preventDefault()
    setSettingsLoading(true)
    try {
      const res = await axios.put('/api/admin/settings', {
        allowRegistrations: !!settings.allowRegistrations,
        maintenanceMode: !!settings.maintenanceMode,
        supportEmail: String(settings.supportEmail || '').trim() || 'support@hso.com',
      })
      if (res?.data) {
        setSettings({
          allowRegistrations: !!res.data.allowRegistrations,
          maintenanceMode: !!res.data.maintenanceMode,
          supportEmail: res.data.supportEmail ?? 'support@hso.com',
        })
        setSettingsJustSaved(true)
        setTimeout(() => setSettingsJustSaved(false), 3000)
      }
      toast.success('Settings saved and applied in real time.')
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to save settings'
      toast.error(msg)
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleDownload = async (type) => {
    setSettingsLoading(true)
    try {
      const endpoint = type === 'audit logs' ? '/api/admin/reports/audit-logs' : '/api/admin/reports/user-list'
      const res = await axios.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type.replace(' ', '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Download completed!')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download report: ' + (err.message || 'Unknown error'))
    } finally {
      setSettingsLoading(false)
    }
  }

  // Admin/Exec handlers
  const handleExecAdd = () => {
    setExecModalUser(null)
    setExecModalMode('add')
    setExecModalOpen(true)
  }

  const handleExecEdit = (user) => {
    setExecModalUser(user)
    setExecModalMode('edit')
    setExecModalOpen(true)
  }

  const handleExecDelete = async (user) => {
    if (window.confirm('Delete this admin/executive?')) {
      setSettingsLoading(true)
      try {
        await axios.delete(`/api/users/${user._id}`)
        toast.success('Admin/Executive deleted')
        window.location.reload()
      } catch (err) {
        toast.error('Failed to delete admin/executive')
      } finally {
        setSettingsLoading(false)
      }
    }
  }

  const handleExecSave = async (form) => {
    setSettingsLoading(true)
    try {
      if (execModalMode === 'add') {
        await axios.post('/api/users', form)
        toast.success('Admin/Executive added')
      } else if (execModalMode === 'edit') {
        await axios.put(`/api/users/${execModalUser._id}`, form)
        toast.success('Admin/Executive updated')
      }
      setExecModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to save admin/executive')
    } finally {
      setSettingsLoading(false)
    }
  }

  const nowStr = useMemo(() => {
    try {
      const d = new Date()
      return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch (_) {
      return ''
    }
  }, [])

  const metricCards = [
    {
      title: 'Total News',
      value: metrics.news,
      icon: Newspaper,
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
      hoverGradient: 'hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600',
      route: '/admin/news',
      label: 'Manage News'
    },
    {
      title: 'Magazines',
      value: metrics.magazines,
      icon: FileText,
      gradient: 'from-indigo-600 via-indigo-500 to-purple-500',
      hoverGradient: 'hover:from-indigo-700 hover:via-indigo-600 hover:to-purple-600',
      route: '/admin/magazines',
      label: 'Manage Magazines'
    },
    {
      title: 'Events',
      value: metrics.events,
      icon: Calendar,
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
      hoverGradient: 'hover:from-purple-700 hover:via-purple-600 hover:to-pink-600',
      route: '/admin/events',
      label: 'Manage Events'
    },
    {
      title: 'Donations',
      value: metrics.donations,
      icon: DollarSign,
      gradient: 'from-green-600 via-green-500 to-emerald-500',
      hoverGradient: 'hover:from-green-700 hover:via-green-600 hover:to-emerald-600',
      route: '/admin/events',
      label: 'Manage Donations'
    },
    {
      title: 'Payments',
      value: metrics.payments,
      icon: CreditCard,
      gradient: 'from-orange-600 via-orange-500 to-amber-500',
      hoverGradient: 'hover:from-orange-700 hover:via-orange-600 hover:to-amber-600',
      route: '/admin/payments',
      label: 'View Payments'
    },
    {
      title: 'Users',
      value: metrics.users,
      icon: Users,
      gradient: 'from-red-600 via-red-500 to-rose-500',
      hoverGradient: 'hover:from-red-700 hover:via-red-600 hover:to-rose-600',
      route: '/admin/users',
      label: 'Manage Users'
    }
  ]

  const quickActions = [
    { icon: FileText, title: 'Create News', desc: 'Add a new article', route: '/admin/news', border: 'border-red-200 hover:border-red-400 hover:bg-red-50', text: 'text-red-700', iconBg: 'bg-red-100', iconText: 'text-red-600' },
    { icon: FileText, title: 'Manage Magazines', desc: 'Digital publications', route: '/admin/magazines', border: 'border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50', text: 'text-indigo-700', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
    { icon: Calendar, title: 'Create Event', desc: 'Schedule an event', route: '/admin/events', border: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50', text: 'text-purple-700', iconBg: 'bg-purple-100', iconText: 'text-purple-600' },
    { icon: Gift, title: 'Create Campaign', desc: 'Start donation drive', route: '/admin/events', border: 'border-green-200 hover:border-green-400 hover:bg-green-50', text: 'text-green-700', iconBg: 'bg-green-100', iconText: 'text-green-600' },
    { icon: UserPlus, title: 'Add User', desc: 'Create new account', route: '/admin/users', border: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50', text: 'text-blue-700', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
    { icon: ShoppingBag, title: 'Manage Shop', desc: 'Add products', route: '/admin/shop', border: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50', text: 'text-orange-700', iconBg: 'bg-orange-100', iconText: 'text-orange-600' },
    { icon: Crown, title: 'Leadership Team', desc: 'Add or edit leadership members', route: '/admin/leadership', border: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50', text: 'text-amber-700', iconBg: 'bg-amber-100', iconText: 'text-amber-600' }
  ]

  const paletteItems = useMemo(() => {
    const items = [
      { group: 'Navigation', title: 'Dashboard Overview', hint: 'Go to dashboard', action: () => { setPaletteOpen(false); setActiveTab('overview') } },
      { group: 'Navigation', title: 'User Management', hint: '/admin/users', action: () => { setPaletteOpen(false); navigate('/admin/users') } },
      { group: 'Navigation', title: 'News Management', hint: '/admin/news', action: () => { setPaletteOpen(false); navigate('/admin/news') } },
      { group: 'Navigation', title: 'Events & Donations', hint: '/admin/events', action: () => { setPaletteOpen(false); navigate('/admin/events') } },
      { group: 'Navigation', title: 'Leadership Team', hint: '/admin/leadership', action: () => { setPaletteOpen(false); navigate('/admin/leadership') } },
      { group: 'Navigation', title: 'Magazine Management', hint: '/admin/magazines', action: () => { setPaletteOpen(false); navigate('/admin/magazines') } },
      { group: 'Navigation', title: 'Payments', hint: '/admin/payments', action: () => { setPaletteOpen(false); navigate('/admin/payments') } },
      { group: 'Navigation', title: 'Admin Profile', hint: '/admin/profile', action: () => { setPaletteOpen(false); navigate('/admin/profile') } },
      { group: 'Navigation', title: 'Admin Settings', hint: '/admin/settings', action: () => { setPaletteOpen(false); setActiveTab('settings') } },
    ]
    const q = (search || '').trim().toLowerCase()
    if (!q) return items
    return items.filter(i => `${i.title} ${i.hint}`.toLowerCase().includes(q))
  }, [navigate, search])

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - High School Observer</title>
        <meta name="description" content="Administrative dashboard for High School Observer" />
      </Helmet>
      
      <div className="min-h-screen bg-[radial-gradient(circle_at_30%_10%,rgba(239,68,68,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.12),transparent_40%),linear-gradient(to_bottom,rgba(249,250,251,1),rgba(255,255,255,1))] p-4 sm:p-6 lg:p-10">
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4 bg-white/70 backdrop-blur-xl border-b border-gray-200/70">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/logo.jpg" 
                  alt="HSO Logo" 
                  className="w-12 h-12 rounded-xl object-cover shadow-lg ring-2 ring-white/20"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">
                  HSO Admin Control Center
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                  <span className="font-medium">Signed in as</span>
                  <span className="font-semibold text-gray-900">{displayName}</span>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    {nowStr}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="relative w-full sm:w-[340px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actions… (Ctrl/⌘ + K)"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-xs flex items-center gap-1"
                  title="Open command palette"
                >
                  <Command className="w-3.5 h-3.5" />
                  K
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setHealthLoading(true)
                    setHealthError('')
                    axios.get('/api/health').then(r => setHealth(r.data)).catch(e => setHealthError(e?.message || 'Failed')).finally(() => setHealthLoading(false))
                  }}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center gap-2"
                  title="Refresh health"
                >
                  <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <div className={`px-3 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                  health?.database?.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  <Activity className={`w-4 h-4 ${health?.database?.connected ? 'text-emerald-600' : 'text-amber-700'}`} />
                  {healthLoading ? 'Checking…' : (health?.database?.connected ? 'System Healthy' : 'Degraded')}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-4 flex items-center gap-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Activity' },
              { id: 'system', label: 'System' },
              { id: 'settings', label: 'Settings' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === t.id ? 'bg-gray-900 text-white shadow' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 lg:pt-10">
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Audit Logs</div>
                      <div className="text-sm text-gray-600">System activity and admin actions</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:flex-initial sm:w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={auditSearch}
                        onChange={(e) => setAuditSearch(e.target.value)}
                        placeholder="Search logs..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 text-sm"
                      />
                    </div>
                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="User">User</option>
                      <option value="DonationCampaign">Donation Campaign</option>
                      <option value="News">News</option>
                      <option value="Event">Event</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleDownload('audit logs')}
                      disabled={settingsLoading}
                      className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b-2 border-gray-300 bg-gray-50">
                        <th className="py-3 px-4 font-bold text-gray-900">ID</th>
                        <th className="py-3 px-4 font-bold text-gray-900">Action</th>
                        <th className="py-3 px-4 font-bold text-gray-900">Type</th>
                        <th className="py-3 px-4 font-bold text-gray-900">Details</th>
                        <th className="py-3 px-4 font-bold text-gray-900">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLoading ? (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-400">Loading...</td>
                        </tr>
                      ) : (() => {
                        const filteredLogs = auditLogs.filter(log => {
                          const matchesSearch = !auditSearch || 
                            log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                            log.resource?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                            JSON.stringify(log.details || {}).toLowerCase().includes(auditSearch.toLowerCase())
                          const matchesFilter = auditFilter === 'all' || log.resource === auditFilter
                          return matchesSearch && matchesFilter
                        })
                        
                        if (filteredLogs.length === 0) {
                          return (
                            <tr>
                              <td colSpan={5} className="text-center py-12 text-gray-400">No audit logs found.</td>
                            </tr>
                          )
                        }
                        
                        return filteredLogs.map(log => (
                        <tr key={log._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                          <td className="py-4 px-4 text-gray-700 font-mono text-xs">
                            {log.resource_id || log.user_id || log._id || '-'}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-900 font-medium">
                            {log.resource || '-'}
                          </td>
                          <td className="py-4 px-4">
                            {log.details && Object.keys(log.details).length > 0 ? (
                              <pre className="whitespace-pre-wrap text-xs bg-gray-50 rounded-md p-2 max-w-md overflow-auto border border-gray-200 font-mono text-gray-700">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-600 text-xs">
                            {new Date(log.created_at).toLocaleString(undefined, {
                              month: 'numeric',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true
                            })}
                          </td>
                        </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
                
                {auditLogs.length > 0 && (() => {
                  const filteredLogs = auditLogs.filter(log => {
                    const matchesSearch = !auditSearch || 
                      log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      log.resource?.toLowerCase().includes(auditSearch.toLowerCase()) ||
                      JSON.stringify(log.details || {}).toLowerCase().includes(auditSearch.toLowerCase())
                    const matchesFilter = auditFilter === 'all' || log.resource === auditFilter
                    return matchesSearch && matchesFilter
                  })
                  
                  return filteredLogs.length !== auditLogs.length && (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                      Showing {filteredLogs.length} of {auditLogs.length} logs
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-green-500 shadow-md shadow-emerald-500/20">
                      <Server className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">System Health</div>
                      <div className="text-sm text-gray-600">Real-time system status and diagnostics</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setHealthLoading(true)
                      setHealthError('')
                      axios.get('/api/health').then(r => setHealth(r.data)).catch(e => setHealthError(e?.message || 'Failed')).finally(() => setHealthLoading(false))
                    }}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${healthLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${health?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        Backend API
                      </div>
                      <span className={`text-xs font-bold ${health?.database?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {healthLoading ? 'Checking…' : (health ? 'Online' : 'Unknown')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">API endpoint status</div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className={`inline-flex w-2.5 h-2.5 rounded-full ${health?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        Database
                      </div>
                      <span className={`text-xs font-bold ${health?.database?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {healthLoading ? 'Checking…' : (health?.database?.status || 'Unknown')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">MongoDB connection</div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Environment</div>
                    <div className="text-sm font-bold text-gray-900">{health?.environment || 'development'}</div>
                    <div className="text-xs text-gray-500 mt-1">Runtime environment</div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-xs text-gray-500 mb-1">Uptime</div>
                    <div className="text-sm font-bold text-gray-900">
                      {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Server uptime</div>
                  </div>
                </div>

                {healthHistory.length > 0 && (
                  <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
                    <div className="text-xs font-semibold text-gray-500 mb-3">Recent health checks</div>
                    <div className="space-y-2">
                      {healthHistory.map((h, idx) => (
                        <div key={h.ts} className="flex items-center justify-between text-xs text-gray-700">
                          <span className="flex items-center gap-2">
                            <span className={`inline-flex w-2.5 h-2.5 rounded-full ${h.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {h.status === 'online' ? 'Online' : 'Degraded'}
                          </span>
                          <span className="text-gray-500">{new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {healthError && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{healthError}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">Database Status</div>
                      <div className="text-sm text-gray-600">Connection and performance metrics</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <span className="text-sm font-semibold text-gray-700">Connection</span>
                      <span className={`text-xs font-bold ${health?.database?.connected ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {health?.database?.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <span className="text-sm font-semibold text-gray-700">Status</span>
                      <span className="text-xs font-bold text-gray-900">{health?.database?.status || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 shadow-md shadow-purple-500/20">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-extrabold text-gray-900">System Metrics</div>
                      <div className="text-sm text-gray-600">Platform performance indicators</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <span className="text-sm font-semibold text-gray-700">Total Users</span>
                      <span className="text-xs font-bold text-gray-900">{formatCompact(metrics.users)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <span className="text-sm font-semibold text-gray-700">Total Content</span>
                      <span className="text-xs font-bold text-gray-900">{formatCompact(metrics.news + metrics.events)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <span className="text-sm font-semibold text-gray-700">Pending Actions</span>
                      <span className="text-xs font-bold text-amber-700">{formatCompact(metrics.pendingApprovals + metrics.unverified)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-500 shadow-md shadow-purple-500/20">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Platform Settings</div>
                    <div className="text-sm text-gray-600">Configure system-wide preferences</div>
                  </div>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      name="allowRegistrations"
                      checked={settings.allowRegistrations}
                      onChange={handleSettingsChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <label className="text-sm font-semibold text-gray-900 cursor-pointer">Allow new user registrations</label>
                      <div className="text-xs text-gray-500">Enable or disable public user registration</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white">
                    <input
                      type="checkbox"
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleSettingsChange}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <div>
                      <label className="text-sm font-semibold text-gray-900 cursor-pointer">Maintenance mode</label>
                      <div className="text-xs text-gray-500">Put the platform in maintenance mode</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-white">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Support Email</label>
                    <input
                      name="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={handleSettingsChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={settingsLoading}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold hover:from-red-700 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {settingsLoading ? 'Saving...' : 'Save Settings'}
                    </button>
                    {settingsJustSaved && (
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        Saved
                      </span>
                    )}
                  </div>
                </form>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-500/20">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Download Reports</div>
                    <div className="text-sm text-gray-600">Export system data and logs</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownload('audit logs')}
                    disabled={settingsLoading}
                    className="px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Audit Logs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload('user list')}
                    disabled={settingsLoading}
                    className="px-4 py-2.5 rounded-xl border border-green-200 bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download User List
                  </button>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-md shadow-red-500/20">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Admin & Executive Management</div>
                    <div className="text-sm text-gray-600">Manage platform administrators and executives</div>
                  </div>
                </div>

                <AdminExecTable
                  onEdit={handleExecEdit}
                  onDelete={handleExecDelete}
                  onAdd={handleExecAdd}
                />
                <AdminExecModal
                  open={execModalOpen}
                  user={execModalUser}
                  onClose={() => setExecModalOpen(false)}
                  onSave={handleExecSave}
                  mode={execModalMode}
                />
              </div>
            </div>
          )}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
                {metricCards.map((card) => {
                  const Icon = card.icon
                  const spark = makeSpark(card.value)
                  const val = Number(card.value) || 0
                  const trendLabel = val > 0 ? 'Live count' : 'No items yet'
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => navigate(card.route)}
                      className="group relative text-left rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_20%_0%,rgba(239,68,68,0.12),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.12),transparent_50%)]" />
                      <div className="relative p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-gray-500">{card.title}</div>
                            <div className="mt-1 text-2xl font-extrabold text-gray-900 tabular-nums">
                              {loading ? '—' : formatCompact(card.value)}
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-gray-900 text-white shadow-sm group-hover:scale-[1.02] transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            {trendLabel}
                          </span>
                          <div className="h-7 w-[92px] flex items-end" title="Distribution">
                            <svg viewBox="0 0 88 30" className="w-full h-full">
                              <path d={spark} fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-900/40" />
                            </svg>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">{card.label}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 shadow-md shadow-red-500/20">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Quick Actions</div>
                    <div className="text-sm text-gray-600">Jump straight into the work</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPaletteOpen(true)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Shortcuts
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.title}
                      type="button"
                      onClick={() => navigate(action.route)}
                      className="group rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-all p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="p-2 rounded-xl bg-gray-900 text-white">
                          <Icon className="w-4 h-4" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <div className="mt-3 text-sm font-extrabold text-gray-900">{action.title}</div>
                      <div className="mt-1 text-xs text-gray-600">{action.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shadow-md ${
                    health?.database?.connected ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-500/20'
                  }`}>
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">System Health</div>
                    <div className="text-sm text-gray-600">Live status (auto refresh)</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className={`inline-flex w-2.5 h-2.5 rounded-full ${health?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    Backend API
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {healthLoading ? 'Checking…' : (health ? 'Online' : 'Unknown')}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span className={`inline-flex w-2.5 h-2.5 rounded-full ${health?.database?.connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    Database
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {healthLoading ? 'Checking…' : (health?.database?.status || 'Unknown')}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="text-xs text-gray-500">Environment</div>
                  <div className="mt-1 text-sm font-bold text-gray-900">{health?.environment || 'development'}</div>
                </div>
                {!!healthError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{healthError}</span>
                  </div>
                )}
                {healthHistory.length > 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Recent health checks</div>
                    <div className="space-y-1.5">
                      {healthHistory.map((h, idx) => (
                        <div key={h.ts} className="flex items-center justify-between text-xs text-gray-700">
                          <span className="flex items-center gap-2">
                            <span className={`inline-flex w-2.5 h-2.5 rounded-full ${h.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {h.status === 'online' ? 'Online' : 'Degraded'}
                          </span>
                          <span className="text-gray-500">{new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
              <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-900 text-white">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Operational Snapshot</div>
                    <div className="text-sm text-gray-600">At-a-glance platform totals</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { k: 'Content', v: metrics.news + metrics.events + metrics.magazines },
                  { k: 'Users', v: metrics.users },
                  { k: 'Payments', v: metrics.payments },
                  { k: 'Donations', v: metrics.donations },
                  { k: 'News', v: metrics.news },
                  { k: 'Events', v: metrics.events },
                  { k: 'Magazines', v: metrics.magazines },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="text-xs font-semibold text-gray-500">{x.k}</div>
                    <div className="mt-1 text-xl font-extrabold text-gray-900">{loading ? '—' : formatCompact(x.v)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 text-white shadow-md shadow-red-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Operator Notes</div>
                    <div className="text-sm text-gray-600">Your personal admin scratchpad (local)</div>
                  </div>
                </div>
              </div>

              <textarea
                className="mt-4 w-full min-h-[140px] rounded-2xl border border-gray-200 bg-white p-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-300"
                placeholder="Write notes… e.g., “Review pending approvals”, “Publish weekly recap”, “Check payment failures”…"
                defaultValue={(() => {
                  try { return localStorage.getItem('admin_notes') || '' } catch (_) { return '' }
                })()}
                onChange={(e) => {
                  try { localStorage.setItem('admin_notes', e.target.value) } catch (_) {}
                }}
              />
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">Approvals & Alerts</div>
                    <div className="text-sm text-gray-600">Keep the queue clean</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-purple-100 bg-purple-50 p-4">
                  <div className="text-xs font-semibold text-purple-700">Pending approvals</div>
                  <div className="mt-1 text-2xl font-extrabold text-purple-900">{loading ? '—' : formatCompact(metrics.pendingApprovals)}</div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-purple-800 hover:text-purple-900"
                  >
                    Review now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="text-xs font-semibold text-amber-700">Unverified users</div>
                  <div className="mt-1 text-2xl font-extrabold text-amber-900">{loading ? '—' : formatCompact(metrics.unverified)}</div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-amber-800 hover:text-amber-900"
                  >
                    Verify now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold text-gray-500 mb-1">Live signals</div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Auto-refreshing metrics every 30s to stay fresh.
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
        {paletteOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/40" onClick={() => setPaletteOpen(false)} />
            <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[92vw] max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-4 border-b border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to search actions…"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setPaletteOpen(false)}
                  className="p-2 rounded-xl hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="max-h-[55vh] overflow-auto p-2">
                {paletteItems.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600">No actions found.</div>
                ) : (
                  <div className="space-y-2">
                    {paletteItems.map((item) => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={item.action}
                        className="w-full text-left p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-gray-900">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.hint}</div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 border border-gray-200 rounded-lg px-2 py-1">
                            {item.group}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                <span>Tip: press Esc to close</span>
                <span className="flex items-center gap-1">
                  <Command className="w-3.5 h-3.5" /> K
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Admin 