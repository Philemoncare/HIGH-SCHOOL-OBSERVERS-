import { Helmet } from 'react-helmet-async'
import AdminAnalyticsDashboard from '../components/AdminAnalyticsDashboard'

function AdminAnalytics() {
  return (
    <>
      <Helmet>
        <title>Analytics - Admin | High School Observer</title>
      </Helmet>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Analytics</h2>
        <div className="bg-white p-6 rounded shadow">
          <AdminAnalyticsDashboard />
        </div>
      </div>
    </>
  )
}

export default AdminAnalytics 