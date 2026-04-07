import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import axios from 'axios'
import {
  Mail,
  MapPin,
  ArrowUp,
  BookOpen,
  Calendar,
  Newspaper,
  ShoppingBag,
  Users,
  Shield,
  Trash2,
  MessageCircle,
  Building2,
  Heart
} from 'lucide-react'

const socialPlatforms = [
  { name: 'Instagram', url: 'https://instagram.com/Highschool_observer', color: 'hover:bg-pink-500', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.058 1.97.24 2.43.41a4.92 4.92 0 011.69 1.09 4.92 4.92 0 011.09 1.69c.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43a4.92 4.92 0 01-1.09 1.69 4.92 4.92 0 01-1.69 1.09c-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41a4.92 4.92 0 01-1.69-1.09 4.92 4.92 0 01-1.09-1.69c-.17-.46-.354-1.26-.41-2.43C2.172 15.584 2.16 15.2 2.16 12s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43a4.92 4.92 0 011.09-1.69 4.92 4.92 0 011.69-1.09c.46-.17 1.26-.354 2.43-.41C8.416 2.172 8.8 2.16 12 2.16zm0-2.16C8.736 0 8.332.012 7.052.07 5.78.128 4.89.312 4.13.54a6.92 6.92 0 00-2.5 1.64A6.92 6.92 0 00.54 4.13C.312 4.89.128 5.78.07 7.052.012 8.332 0 8.736 0 12c0 3.264.012 3.668.07 4.948.058 1.27.242 2.16.47 2.92a6.92 6.92 0 001.64 2.5 6.92 6.92 0 002.5 1.64c.76.228 1.65.412 2.92.47C8.332 23.988 8.736 24 12 24s3.668-.012 4.948-.07c1.27-.058 2.16-.242 2.92-.47a6.92 6.92 0 002.5-1.64 6.92 6.92 0 001.64-2.5c.228-.76.412-1.65.47-2.92.058-1.28.07-1.684.07-4.948s-.012-3.668-.07-4.948c-.058-1.27-.242-2.16-.47-2.92a6.92 6.92 0 00-1.64-2.5A6.92 6.92 0 0019.87.54c-.76-.228-1.65-.412-2.92-.47C15.668.012 15.264 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z' },
  { name: 'Facebook', url: 'https://facebook.com/HighSchoolObserver', color: 'hover:bg-blue-600', path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V9.798h2.54V7.5c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z' },
  { name: 'TikTok', url: 'https://tiktok.com/@Highschobserver', color: 'hover:bg-gray-900', path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
  { name: 'Threads', url: 'https://threads.net/@Highschool_observer', color: 'hover:bg-gray-700', path: 'M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.06v-.12c.018-4.287 2.346-7.371 6.5-9.02V2.5C8.018.567 9.35 0 11.5 0h.5c2.15 0 3.482.567 4.5 2.5v.42c4.154 1.649 6.482 4.733 6.5 9.02v.12c-.018 3.526-.85 6.38-2.495 8.431-1.85 2.304-4.603 3.485-8.184 3.509h-.115z' },
  { name: 'YouTube', url: 'https://youtube.com/@Highschoolobservergh', color: 'hover:bg-red-600', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' }
]

const exploreLinks = [
  { to: '/about', label: 'About HSO', icon: Building2 },
  { to: '/news', label: 'News', icon: Newspaper },
  { to: '/events', label: 'Events & Donations', icon: Calendar },
  { to: '/shop', label: 'Shop', icon: ShoppingBag },
  { to: '/magazine', label: 'Magazine', icon: BookOpen },
  { to: '/leadership', label: 'Leadership', icon: Users },
  { to: '/contact', label: 'Contact', icon: MessageCircle }
]

const legalLinks = [
  { to: '/privacy', label: 'Privacy Policy', icon: Shield },
  { to: '/data-deletion', label: 'Data Deletion', icon: Trash2 }
]

function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [showBackTop, setShowBackTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }
    try {
      setLoading(true)
      const res = await axios.post('/api/newsletter/subscribe', { email })
      toast.success(res.data?.message || 'You’re subscribed. Thanks!')
      setEmail('')
      setSubscribed(true)
    } catch (err) {
      const msg = err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'Server unreachable. Try again later.' : 'Subscription failed. Try again.')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <footer className="relative mt-auto bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(127,29,29,0.4)_0%,transparent_50%),linear-gradient(225deg,rgba(153,27,27,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-4">
              <Link to="/" className="inline-flex items-center gap-3 mb-4">
                <img src="/images/logo.jpg" alt="HSO" className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/20" />
                <div>
                  <span className="font-bold text-lg text-white">High School Observer</span>
                  <p className="text-xs text-slate-400">Connecting minds across Ghana</p>
                </div>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-4">
                A vibrant community of active young schoolers and pre-tertiary voices. Events, news, and impact.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Trusted by 150+ schools · 2,500+ members</span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
              <ul className="space-y-2">
                {exploreLinks.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <Link to={to} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                      <Icon className="w-3.5 h-3.5 opacity-70" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Stay updated</h4>
              {subscribed ? (
                <p className="text-slate-400 text-sm">You’re on the list. We’ll send updates to your inbox.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
              )}
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <a href="mailto:highschoolobserver91@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  highschoolobserver91@gmail.com
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect</h4>
              <div className="flex flex-wrap gap-2">
                {socialPlatforms.map(({ name, url, color, path }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 text-white ${color} transition-colors`}
                    title={name}
                    aria-label={name}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d={path} /></svg>
                  </a>
                ))}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Legal</h4>
                <ul className="space-y-1">
                  {legalLinks.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <Link to={to} className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
                        <Icon className="w-3.5 h-3.5 opacity-70" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} High School Observer (HSO). All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors">Privacy</Link>
              <Link to="/contact" className="text-slate-500 hover:text-white transition-colors">Contact</Link>
              <Link to="/data-deletion" className="text-slate-500 hover:text-white transition-colors">Data Deletion</Link>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showBackTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-white shadow-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}

export default Footer
