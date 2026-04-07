import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Globe, Linkedin, Twitter, Calendar, MapPin, Building2, Award, Target } from 'lucide-react'
import RealIcon from '../components/RealIcon'

function LeadershipProfile() {
  const { slug } = useParams()
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`/api/leadership/by-slug/${encodeURIComponent(slug)}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Profile not found')
          throw new Error('Failed to load profile')
        }
        const data = await res.json()
        if (!cancelled) setMember(data)
      } catch (e) {
        if (!cancelled) {
          setMember(null)
          setError(e?.message || 'Unable to load profile')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [slug])

  const title = useMemo(() => {
    if (!member) return 'Leadership Profile - High School Observer'
    return `${member.name} - ${member.title || 'Leadership'} | High School Observer`
  }, [member])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-gray-900 font-semibold mb-2">{error}</p>
          <p className="text-gray-600 mb-6">Go back to the leadership directory and choose another profile.</p>
          <Link to="/leadership" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Leadership
          </Link>
        </div>
      </div>
    )
  }

  if (!member) return null

  const links = member.social_links || {}
  const highlights = Array.isArray(member.highlights) ? member.highlights.filter(Boolean) : []
  const focusAreas = Array.isArray(member.focus_areas) ? member.focus_areas.filter(Boolean) : []

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={(member.bio || '').slice(0, 155) || `Leadership profile for ${member.name}.`} />
      </Helmet>

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-600">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative">
          <Link to="/leadership" className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium">
            <ArrowLeft className="w-4 h-4" />
            Leadership Directory
          </Link>

          <div className="mt-8 grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur p-6"
              >
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <RealIcon
                      symbol={member.avatar_emoji || '👤'}
                      badge
                      className="w-14 h-14"
                      colorClassName="text-white"
                      badgeClassName="w-28 h-28 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center"
                      title={member.name}
                    />
                  )}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {member.department && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/15 text-white text-sm">
                      <Building2 className="w-4 h-4" />
                      {member.department}
                    </span>
                  )}
                  {member.location && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/15 text-white text-sm">
                      <MapPin className="w-4 h-4" />
                      {member.location}
                    </span>
                  )}
                  {member.start_year && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/15 text-white text-sm">
                      <Calendar className="w-4 h-4" />
                      Since {member.start_year}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>

            <div className="md:col-span-3 text-white">
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{member.name}</h1>
                <p className="mt-2 text-white/90 font-semibold uppercase tracking-wide text-sm">{member.title}</p>
                <p className="mt-4 text-white/90 leading-relaxed">{member.bio}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {links.email && (
                    <a href={`mailto:${links.email}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-red-700 font-semibold hover:bg-red-50 transition-colors">
                      <Mail className="w-4 h-4" />
                      Email
                    </a>
                  )}
                  {links.website && (
                    <a href={links.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/15 text-white font-semibold hover:bg-white/20 transition-colors">
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {links.linkedin && (
                    <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/15 text-white font-semibold hover:bg-white/20 transition-colors">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {links.twitter && (
                    <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/15 text-white font-semibold hover:bg-white/20 transition-colors">
                      <Twitter className="w-4 h-4" />
                      X
                    </a>
                  )}
                  {member.calendly_link && (
                    <a href={member.calendly_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-gray-900 font-semibold hover:bg-amber-300 transition-colors">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-[#fafbfc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              Highlights
            </div>
            {highlights.length ? (
              <ul className="space-y-3">
                {highlights.map((h, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-2 w-2 h-2 rounded-full bg-red-600 flex-none" />
                    <span className="text-gray-700">{h}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Highlights will appear here as the profile is updated.</p>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
              <Target className="w-5 h-5 text-blue-600" />
              Focus areas
            </div>
            {focusAreas.length ? (
              <div className="flex flex-wrap gap-2">
                {focusAreas.map((a, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Focus areas will appear here as the profile is updated.</p>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default LeadershipProfile

