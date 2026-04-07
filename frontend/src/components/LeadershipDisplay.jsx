import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Linkedin, 
  Twitter, 
  Mail, 
  Globe, 
  Users,
  Star,
  Heart,
  ArrowRight,
  X,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import RealIcon from './RealIcon';

function LeadershipDisplay() {
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [error, setError] = useState('');

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
    return null; // Don't show anything if no leadership members
  }

  // Bento: first featured or first member gets spotlight; rest in grid
  const featuredFirst = [...leadership].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
  const spotlight = featuredFirst[0];
  const rest = featuredFirst.slice(1);

  return (
    <>
      <section className="py-20 bg-[#fafbfc] relative overflow-hidden">
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

          {spotlight && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((member, index) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group"
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
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
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
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); openMemberModal(member); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                      {member.bio || 'Leadership team member.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

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
                   <img
                     src={selectedMember.image}
                     alt={selectedMember.name}
                     className="w-full h-full object-cover"
                   />
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
