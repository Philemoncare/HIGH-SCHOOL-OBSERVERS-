import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LeadershipDisplay from '../components/LeadershipDisplay';
import { Globe, ArrowRight, MessageCircle, BookOpen } from 'lucide-react';

function Leadership() {
  return (
    <>
      <Helmet>
        <title>Leadership Team - High School Observer</title>
        <meta name="description" content="Meet the visionary leaders and dedicated professionals who drive HSO's mission to empower students and transform education across Ghana." />
      </Helmet>
      <section className="relative py-20 bg-gradient-to-br from-red-600 via-red-700 to-pink-600 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <div className="flex items-center justify-center mb-6">
              <Users className="w-12 h-12 mr-4" />
              <h1 className="text-5xl md:text-6xl font-bold">Our Leadership Team</h1>
            </div>
            <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto leading-relaxed">
              Meet the visionary leaders and dedicated professionals who drive HSO's mission 
              to empower students and transform education across Ghana.
            </p>
          </motion.div>
        </div>
      </section>
      <LeadershipDisplay />
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Globe className="w-14 h-14 mx-auto mb-6 text-red-400" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Join Our Mission</h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Be part of a community that's transforming education and empowering students
              across Ghana. Connect with our leadership team and discover opportunities to contribute.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Our Team
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[200px] px-8 py-4 rounded-xl border-2 border-white/60 text-white font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <BookOpen className="w-5 h-5" />
                Learn More About HSO
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default Leadership;
