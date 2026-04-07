import { useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, Tag, ArrowLeft, ChevronRight } from 'lucide-react'
import EventRegistrationModal from '../components/EventRegistrationModal'
import BackButton from '../components/BackButton'

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop'

function EventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!id) {
        setError('Invalid event')
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setError('')
        const res = await axios.get(`/api/events/public/${id}`, { validateStatus: (s) => s < 500 })
        if (cancelled) return
        if (res.status === 200 && res.data) {
          const e = res.data
          const priceNum = e.price === 'Free' || e.price === 'free' ? 0 : (parseFloat(e.price) || 0)
          setEvent({
            ...e,
            id: e._id,
            date: e.date,
            time: e.time || 'TBA',
            price: priceNum,
            capacity: e.capacity ?? 100,
            registered: e.registered ?? 0
          })
        } else {
          setError(res.data?.error || 'Event not found')
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load event')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  const formatDate = (dateVal) => {
    if (!dateVal) return 'TBA'
    const d = new Date(dateVal)
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatPrice = (price) => {
    if (price === 0 || price === 'Free' || price === 'free') return 'Free'
    if (price == null || price === '') return 'Free'
    const str = String(price).trim()
    if (str.startsWith('₵') || /^GHS\s*/i.test(str)) return str
    const num = parseFloat(str.replace(/[^\d.-]/g, '')) || 0
    return num === 0 ? 'Free' : `₵${num.toLocaleString()}`
  }

  const getRegistrationStatus = () => {
    if (!event) return { status: 'available', text: 'Available', color: 'bg-green-100 text-green-800', bg: 'bg-green-500' }
    const reg = event.registered ?? 0
    const cap = event.capacity ?? 100
    if (cap <= 0) return { status: 'available', text: 'Available', color: 'bg-green-100 text-green-800', bg: 'bg-green-500' }
    const pct = (reg / cap) * 100
    if (pct >= 100) return { status: 'full', text: 'Event Full', color: 'bg-red-100 text-red-800', bg: 'bg-red-500' }
    if (pct >= 80) return { status: 'limited', text: 'Limited Spots', color: 'bg-amber-100 text-amber-800', bg: 'bg-amber-500' }
    return { status: 'available', text: 'Available', color: 'bg-green-100 text-green-800', bg: 'bg-green-500' }
  }

  if (loading) {
    return (
      <>
        <Helmet><title>Loading… - HSO Events</title></Helmet>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-red-600 border-t-transparent" />
        </div>
      </>
    )
  }

  if (error || !event) {
    return (
      <>
        <Helmet><title>Event Not Found - HSO</title></Helmet>
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
          <p className="text-slate-600 mb-4">{error || 'Event not found'}</p>
          <BackButton fallbackPath="/events">Back to Events</BackButton>
        </div>
      </>
    )
  }

  const registrationStatus = getRegistrationStatus()
  const imageUrl = event.image && (event.image.startsWith('data:') || event.image.startsWith('http')) ? event.image : PLACEHOLDER_IMAGE
  const categoryLabel = (event.category || 'event').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <Helmet>
        <title>{event.title} - High School Observer</title>
        <meta name="description" content={event.description ? String(event.description).replace(/<[^>]+>/g, '').slice(0, 160) : event.title} />
        <meta property="og:image" content={imageUrl} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <div className="relative h-[45vh] min-h-[280px] max-h-[420px] bg-slate-800 overflow-hidden">
          <img
            src={imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto max-w-6xl">
              <BackButton
                fallbackPath="/events"
                className="inline-flex items-center gap-1 text-white/90 hover:text-white text-sm mb-4"
              >
                Events
              </BackButton>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                  {categoryLabel}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${registrationStatus.color}`}>
                  {registrationStatus.text}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {event.title}
              </h1>
              {event.organizer && (
                <p className="mt-2 text-white/90 text-sm md:text-base">
                  by {event.organizer}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 -mt-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-red-600" /> About this event
                  </h2>
                  <div className="prose prose-slate max-w-none">
                    {event.description ? (
                      <div dangerouslySetInnerHTML={{ __html: typeof event.description === 'string' ? event.description : '' }} />
                    ) : (
                      <p className="text-slate-600">No description available.</p>
                    )}
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" /> Date & time
                  </h2>
                  <div className="flex flex-wrap gap-6 text-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-50">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</p>
                        <p className="font-medium">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-red-50">
                        <Clock className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Time</p>
                        <p className="font-medium">{event.time || 'TBA'}</p>
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-50">
                          <MapPin className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                          <p className="font-medium">{event.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            </div>

            <div className="lg:col-span-1">
              <motion.aside
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="sticky top-24 space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-600">Price</span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatPrice(event.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Capacity</span>
                      <span className="font-medium text-slate-900">{event.capacity ?? '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-6">
                      <span>Registered</span>
                      <span className="font-medium text-slate-900">{event.registered ?? 0}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                      <div
                        className="h-2 rounded-full bg-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((event.registered ?? 0) / (event.capacity || 1)) * 100)}%` }}
                      />
                    </div>
                    <button
                      onClick={() => setShowRegistrationModal(true)}
                      disabled={registrationStatus.status === 'full'}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-900/20"
                    >
                      Register for Event
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {event.organizer && (
                  <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Organizer</h3>
                    <p className="font-medium text-slate-900">{event.organizer}</p>
                    <p className="text-sm text-slate-600 mt-0.5">High School Observer</p>
                  </div>
                )}
              </motion.aside>
            </div>
          </div>
        </div>
      </div>

      <EventRegistrationModal
        open={showRegistrationModal}
        event={event}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={() => setShowRegistrationModal(false)}
      />
    </>
  )
}

export default EventDetail
