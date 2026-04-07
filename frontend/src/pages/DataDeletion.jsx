import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import BackButton from '../components/BackButton'

function DataDeletion() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Helmet>
        <title>User Data Deletion - High School Observer</title>
        <meta name="description" content="How to request deletion of your data from High School Observer" />
      </Helmet>
      <div className="flex items-center gap-2 mb-6">
        <Trash2 className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold text-gray-900">User Data Deletion</h1>
      </div>
      <div className="prose prose-gray max-w-none space-y-4">
        <p>
          You can request deletion of your account and associated data from High School Observer in the following ways:
        </p>
        <h2 className="text-xl font-semibold mt-6">Option 1: From your account</h2>
        <p>
          If you are logged in, go to <Link to="/profile" className="text-red-600 hover:underline">Profile</Link> and use the account or settings section to request account deletion, if available.
        </p>
        <h2 className="text-xl font-semibold mt-6">Option 2: By email</h2>
        <p>
          Send an email to{' '}
          <a href="mailto:highschoolobserver91@gmail.com" className="text-red-600 hover:underline">highschoolobserver91@gmail.com</a>{' '}
          from the email address associated with your account. Include &quot;Data Deletion Request&quot; in the subject and we will process your request and confirm once your data has been removed.
        </p>
        <h2 className="text-xl font-semibold mt-6">What we delete</h2>
        <p>
          We will remove your account, profile data, and other personal information we hold. Some data may be retained where required by law (e.g. transaction records).
        </p>
      </div>
      <p className="mt-8">
        <BackButton fallbackPath="/">← Back to Home</BackButton>
      </p>
    </div>
  )
}

export default DataDeletion
