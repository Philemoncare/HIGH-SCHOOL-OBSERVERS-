import { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ArrowRight,
  X,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import RealIcon from './RealIcon';

function LeadershipDisplay({ variant = 'full' }) {
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const railRef = useRef(null);

  useEffect(() => {
    fetchLeadership();
  }, []);

  const fetchLeadership = async () => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      const response = await fetch('/api/leadership');
      
      if (!response.ok) {
        throw new Error('Failed to fetch leadership team');
      }
      
      const data = await response.json();
      // Ensure data is an array
      setLeadership(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Error loading leadership team');
      console.error('Leadership fetch error:', error);
      setLeadership([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const openMemberModal = (member) => {
    setSelectedMember(member);
  };

  const closeMemberModal = () => {
    setSelectedMember(null);
  };

  const departments = useMemo(() => {
    const set = new Set();
    leadership.forEach(m => {
      const d = (m.department || '').trim();
      if (d) set.add(d);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [leadership]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leadership.filter(m => {
      if (onlyFeatured && !m.is_featured) return false;
      if (department !== 'all' && (m.department || '').trim() !== department) return false;
      if (variant === 'home' && !m.is_featured) {
        // On homepage we emphasize featured first, but still show others if filters/search are used.
        // This line is intentionally not filtering by default unless a user toggles Featured.
      }
      if (!q) return true;
      return (
        (m.name || '').toLowerCase().includes(q) ||
        (m.title || '').toLowerCase().includes(q) ||
        (m.department || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q) ||
        (m.bio || '').toLowerCase().includes(q)
      );
    });
  }, [leadership, query, department, onlyFeatured]);

  const { spotlight, groupedRest } = useMemo(() => {
    const featuredFirst = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    const spotlight = featuredFirst[0] || null;
    const rest = featuredFirst.slice(1);

    const groups = new Map();
    rest.forEach(m => {
      const d = (m.department || 'Leadership').trim() || 'Leadership';
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d).push(m);
    });

    return {
      spotlight,
      groupedRest: Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    };
  }, [filtered]);

  const homeCards = useMemo(() => {
    if (variant !== 'home') return [];
    const featuredFirst = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    return featuredFirst.slice(0, 10);
  }, [filtered, variant]);

  const homeLoop = useMemo(() => {
    if (variant !== 'home') return [];
    // Duplicate to create a seamless "advanced" feel.
    return homeCards.length > 0 ? [...homeCards, ...homeCards] : [];
  }, [homeCards, variant]);

  useEffect(() => {
    if (variant !== 'home') return;
    const el = railRef.current;
    if (!el) return;
    if (homeCards.length <= 1) return;

    const id = window.setInterval(() => {
      // Gently nudge the carousel forward.
      el.scrollBy({ left: 360, behavior: 'smooth' });
      // If we've scrolled far into the duplicated list, reset near the start.
      if (el.scrollLeft > el.scrollWidth * 0.55) {
        el.scrollTo({ left: 0, behavior: 'auto' });
      }
    }, 2800);

    return () => window.clearInterval(id);
  }, [variant, homeCards.length]);

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading our leadership team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (leadership.length === 0) {
    return (
      <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">No leadership members have been published yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className={variant === 'home' ? 'py-16 bg-[#fafbfc] relative overflow-hidden' : 'py-20 bg-[#fafbfc] relative overflow-hidden'}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 text-red-600 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Leadership
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The people driving HSO's mission to empower students and transform education across Ghana.
            </p>
          </motion.div>

          {variant !== 'home' && (
            <div className="max-w-3xl mx-auto mb-10">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        type="search"
                        placeholder="Search by name, role, department, location…"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        >
                          <option value="all">All departments</option>
                          {departments.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 select-none">
                      <input
                        type="checkbox"
                        checked={onlyFeatured}
                        onChange={(e) => setOnlyFeatured(e.target.checked)}
                        className="accent-red-600"
                      />
                      Featured
                    </label>
                  </div>
                </div>
                {filtered.length === 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    No results. Try clearing filters or searching a different keyword.
                  </div>
                )}
              </div>
            </div>
          )}

          {variant !== 'home' && spotlight && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div
                onClick={() => openMemberModal(spotlight)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-red-100"
              >
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-2 relative h-72 md:h-auto min-h-[320px] bg-gradient-to-br from-red-600 to-rose-700 overflow-hidden">
                    {spotlight.image ? (
                      <img
                        src={spotlight.image}
                        alt={spotlight.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RealIcon
                          symbol={spotlight.avatar_emoji || '👤'}
                          badge
                          className="w-16 h-16"
                          colorClassName="text-white"
                          badgeClassName="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"
                          title={spotlight.name}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent md:from-transparent md:via-transparent md:to-transparent md:group-hover:from-black/20" />
                    {spotlight.is_featured && (
                      <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-amber-400/95 text-gray-900 text-xs font-bold uppercase tracking-wider shadow-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="md:col-span-3 flex flex-col justify-center p-8 md:p-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 tracking-tight">
                      {spotlight.name}
                    </h3>
                    <p className="text-red-600 font-semibold uppercase tracking-wide text-sm mb-4">
                      {spotlight.title}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                      {spotlight.bio || 'Leadership team member.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); openMemberModal(spotlight); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-500/25"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      {spotlight.slug && (
                        <Link
                          to={`/leadership/${spotlight.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors"
                        >
                          View Profile
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                      <div className="flex gap-2">
                        {spotlight.social_links?.linkedin && (
                          <a href={spotlight.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Linkedin className="w-4 h-4" />
                          </a>
                        )}
                        {spotlight.social_links?.twitter && (
                          <a href={spotlight.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Twitter className="w-4 h-4" />
                          </a>
                        )}
                        {spotlight.social_links?.email && (
                          <a href={`mailto:${spotlight.social_links.email}`} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {variant === 'home' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-500">Executive + departments</p>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Meet the team</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => railRef.current?.scrollBy({ left: -360, behavior: 'smooth' })}
                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => railRef.current?.scrollBy({ left: 360, behavior: 'smooth' })}
                    className="p-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                    aria-label="Scroll right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#fafbfc] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#fafbfc] to-transparent pointer-events-none" />

                <div
                  ref={railRef}
                  className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none]"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {homeLoop.map((member, idx) => (
                    <motion.div
                      key={`${member._id}-${idx}`}
                      className="snap-start flex-none w-[280px] sm:w-[320px] lg:w-[340px]"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: (idx % 6) * 0.04 }}
                      whileHover={{ y: -6 }}
                    >
                      <div
                        onClick={() => openMemberModal(member)}
                        className="h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-100"
                      >
                        <div className="relative h-44 bg-gradient-to-br from-red-500/90 to-rose-600 overflow-hidden">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover [object-position:50%_25%] group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <RealIcon
                                symbol={member.avatar_emoji || '👤'}
                                badge
                                className="w-10 h-10"
                                colorClassName="text-white"
                                badgeClassName="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"
                                title={member.name}
                              />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          {member.is_featured && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400/95 text-gray-900 text-xs font-bold uppercase">
                              Featured
                            </span>
                          )}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-lg font-bold text-white drop-shadow-md leading-tight">{member.name}</h3>
                            <p className="text-red-200 font-semibold text-sm">{member.title}</p>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {member.bio || 'Leadership team member.'}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            {member.slug ? (
                              <Link
                                to={`/leadership/${member.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-red-700"
                              >
                                View profile
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            ) : (
                              <span className="text-sm font-semibold text-gray-400">Profile</span>
                            )}
                            {member.department && (
                              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                {member.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/leadership"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Explore the full team
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {variant !== 'home' && groupedRest.map(([dept, members]) => (
            <div key={dept} className="mb-12">
              <div className="flex items-end justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{dept}</h3>
                  <p className="text-sm text-gray-600">{members.length} member{members.length === 1 ? '' : 's'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {members.map((member, index) => (
                  <motion.div
                    key={member._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    className="group w-full max-w-sm"
                  >
                    <div
                      onClick={() => openMemberModal(member)}
                      className="h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-100 hover:-translate-y-1"
                    >
                      <div className="relative h-52 bg-gradient-to-br from-red-500/90 to-rose-600 overflow-hidden">
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover [object-position:50%_25%] group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <RealIcon
                              symbol={member.avatar_emoji || '👤'}
                              badge
                              className="w-10 h-10"
                              colorClassName="text-white"
                              badgeClassName="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"
                              title={member.name}
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {member.is_featured && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-400/95 text-gray-900 text-xs font-bold uppercase">
                            Featured
                          </span>
                        )}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white drop-shadow-md">{member.name}</h3>
                            <p className="text-red-200 font-semibold text-sm">{member.title}</p>
                            {(member.location || member.start_year) && (
                              <p className="text-white/80 text-xs mt-0.5">
                                {member.location ? member.location : ''}{member.location && member.start_year ? ' • ' : ''}{member.start_year ? `Since ${member.start_year}` : ''}
                              </p>
                            )}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                            {member.slug && (
                              <Link
                                to={`/leadership/${member.slug}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-white text-sm font-medium bg-gray-900/40 backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-gray-900/55"
                              >
                                Profile
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); openMemberModal(member); }}
                              className="flex items-center gap-1 text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5"
                            >
                              Details
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {member.bio || 'Leadership team member.'}
                        </p>
                        {Array.isArray(member.focus_areas) && member.focus_areas.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {member.focus_areas.slice(0, 3).map((a, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 via-red-700 to-rose-800 p-8 sm:p-10 md:p-12 text-white shadow-2xl">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-300 rounded-full translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/10" aria-hidden>
                <Heart className="w-24 h-24 sm:w-32 sm:h-32" />
              </div>
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 mb-6"
                >
                  <Heart className="w-7 h-7 text-red-200" />
                </motion.span>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Join Our Mission</h3>
                <p className="text-red-100/95 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                  Be part of a community that's transforming education and empowering students
                  across Ghana. Connect with our leadership team and discover opportunities to contribute.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[180px] px-6 py-3.5 rounded-xl bg-white text-red-700 font-semibold shadow-lg hover:shadow-xl hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-700"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Us
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[180px] px-6 py-3.5 rounded-xl border-2 border-white/80 text-white font-semibold hover:bg-white hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-red-700"
                  >
                    <BookOpen className="w-5 h-5" />
                    Learn More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

       <AnimatePresence>
         {selectedMember && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
             onClick={closeMemberModal}
           >
             <motion.div
               initial={{ scale: 0.8, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.8, opacity: 0, y: 20 }}
               transition={{ type: "spring", damping: 25, stiffness: 300 }}
               className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden relative"
               onClick={(e) => e.stopPropagation()}
             >
               <button
                 onClick={closeMemberModal}
                 className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 shadow-lg"
               >
                 <X className="w-5 h-5 text-gray-700" />
               </button>

               <div className="relative h-48 bg-gradient-to-br from-red-500 via-red-600 to-pink-500 overflow-hidden">
                 {selectedMember.image ? (
                   <>
                     <div
                       className="absolute inset-0 scale-110 blur-2xl opacity-50"
                       style={{ backgroundImage: `url(${selectedMember.image})`, backgroundSize: 'cover', backgroundPosition: '50% 25%' }}
                     />
                     <img
                       src={selectedMember.image}
                       alt={selectedMember.name}
                       className="relative w-full h-full object-cover [object-position:50%_25%]"
                     />
                   </>
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <RealIcon
                       symbol="👤"
                       badge
                       className="w-12 h-12"
                       colorClassName="text-white"
                       badgeClassName="w-24 h-24 rounded-3xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"
                       title="Member"
                     />
                   </div>
                 )}
                 
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                 
                 <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                   <h2 className="text-2xl font-bold mb-1">{selectedMember.name}</h2>
                   <p className="text-red-200 font-semibold">{selectedMember.title}</p>
                 </div>
               </div>
               <div className="p-6">
                 <div className="mb-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                     <Star className="w-5 h-5 text-yellow-400 mr-2" />
                     About
                   </h3>
                   <p className="text-gray-600 leading-relaxed text-sm">
                     {selectedMember.bio}
                   </p>
                 </div>

                 {(selectedMember.department || selectedMember.location || selectedMember.start_year) && (
                   <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {selectedMember.department && (
                       <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                         <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</div>
                         <div className="text-sm font-semibold text-gray-900 mt-1">{selectedMember.department}</div>
                       </div>
                     )}
                     {selectedMember.location && (
                       <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                         <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</div>
                         <div className="text-sm font-semibold text-gray-900 mt-1">{selectedMember.location}</div>
                       </div>
                     )}
                     {selectedMember.start_year && (
                       <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                         <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Since</div>
                         <div className="text-sm font-semibold text-gray-900 mt-1">{selectedMember.start_year}</div>
                       </div>
                     )}
                   </div>
                 )}

                 {Array.isArray(selectedMember.highlights) && selectedMember.highlights.length > 0 && (
                   <div className="mb-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                       <Star className="w-5 h-5 text-amber-500 mr-2" />
                       Highlights
                     </h3>
                     <ul className="space-y-2">
                       {selectedMember.highlights.slice(0, 5).map((h, idx) => (
                         <li key={idx} className="flex gap-2 text-sm text-gray-700">
                           <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-600 flex-none" />
                           <span>{h}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {selectedMember.social_links && (
                   <div className="border-t border-gray-200 pt-4">
                     <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                       <Globe className="w-5 h-5 text-blue-500 mr-2" />
                       Connect
                     </h3>
                     <div className="grid grid-cols-2 gap-3">
                       {selectedMember.social_links.linkedin && (
                         <a
                           href={selectedMember.social_links.linkedin}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
                         >
                           <Linkedin className="w-4 h-4" />
                           <span>LinkedIn</span>
                         </a>
                       )}
                       {selectedMember.social_links.twitter && (
                         <a
                           href={selectedMember.social_links.twitter}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center space-x-2 bg-blue-400 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition-all duration-200 text-sm font-medium"
                         >
                           <Twitter className="w-4 h-4" />
                           <span>Twitter</span>
                         </a>
                       )}
                       {selectedMember.social_links.email && (
                         <a
                           href={`mailto:${selectedMember.social_links.email}`}
                           className="flex items-center justify-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 text-sm font-medium"
                         >
                           <Mail className="w-4 h-4" />
                           <span>Email</span>
                         </a>
                       )}
                       {selectedMember.social_links.website && (
                         <a
                           href={selectedMember.social_links.website}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium"
                         >
                           <Globe className="w-4 h-4" />
                           <span>Website</span>
                         </a>
                       )}
                     </div>
                   </div>
                 )}

                 <div className="mt-6 pt-4 border-t border-gray-200">
                   <div className="flex space-x-3">
                     <button
                       onClick={closeMemberModal}
                       className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
                     >
                       Close
                     </button>
                     {selectedMember.slug && (
                       <Link
                         to={`/leadership/${selectedMember.slug}`}
                         onClick={closeMemberModal}
                         className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 text-center"
                       >
                         View Profile
                       </Link>
                     )}
                     {selectedMember.social_links?.email && (
                       <a
                         href={`mailto:${selectedMember.social_links.email}`}
                         className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 text-center"
                       >
                         Contact
                       </a>
                     )}
                   </div>
                 </div>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </>
  );
}

export default LeadershipDisplay;
