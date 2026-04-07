import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
import BackButton from '../components/BackButton'

function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Helmet>
        <title>Privacy Policy - High School Observer</title>
        <meta name="description" content="Privacy Policy for High School Observer" />
      </Helmet>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-gray max-w-none space-y-4">
        <p>
          High School Observer (&quot;HSO&quot;) respects your privacy. This policy describes how we collect, use, and protect your information when you use our website and services.
        </p>
        <h2 className="text-xl font-semibold mt-6">Information we collect</h2>
        <p>
          We may collect your name, email address, profile information (including from social login providers such as Google and Facebook when you choose to sign in with them), and any information you provide when using our site (e.g. events, donations, shop).
        </p>
        <h2 className="text-xl font-semibold mt-6">How we use it</h2>
        <p>
          We use this information to provide and improve our services, communicate with you, process transactions, and comply with legal obligations.
        </p>
        <h2 className="text-xl font-semibold mt-6">Data retention & deletion</h2>
        <p>
          You may request deletion of your data at any time. See our <Link to="/data-deletion" className="text-red-600 hover:underline">Data Deletion</Link> page for instructions, or contact us at{' '}
          <a href="mailto:highschoolobserver91@gmail.com" className="text-red-600 hover:underline">highschoolobserver91@gmail.com</a>.
        </p>
        <h2 className="text-xl font-semibold mt-6">Contact</h2>
        <p>
          For privacy questions: <a href="mailto:highschoolobserver91@gmail.com" className="text-red-600 hover:underline">highschoolobserver91@gmail.com</a>.
        </p>
      </div>
      <p className="mt-8">
        <BackButton fallbackPath="/">← Back to Home</BackButton>
      </p>
    </div>
  )
}

export default Privacy
