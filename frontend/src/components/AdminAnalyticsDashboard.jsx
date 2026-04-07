import { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'
import toast from 'react-hot-toast'

const COLORS = ['#2563eb', '#22c55e', '#f59e42']

function AdminAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userGrowthData, setUserGrowthData] = useState([])
  const [eventParticipationData, setEventParticipationData] = useState([])
  const [salesData, setSalesData] = useState([])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('/api/admin/analytics', { params: dateRange })
      setUserGrowthData(res.data.userGrowth || [])
      setEventParticipationData(res.data.eventParticipation || [])
      setSalesData(res.data.sales || [])
    } catch (err) {
      setError('Failed to load analytics')
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line
  }, [dateRange.from, dateRange.to])

  const handleDateChange = e => {
    const { name, value } = e.target
    setDateRange(r => ({ ...r, [name]: value }))
  }

  const handleDownload = format => {
    toast.dismiss('analytics-export')
    toast('Export will be available soon.', {
      id: 'analytics-export',
      duration: 3000
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-sm font-medium">From</label>
          <input type="date" name="from" value={dateRange.from} onChange={handleDateChange} className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">To</label>
          <input type="date" name="to" value={dateRange.to} onChange={handleDateChange} className="border rounded px-3 py-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>handleDownload('csv')}>Download CSV</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={()=>handleDownload('pdf')}>Download PDF</button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-blue-600">Loading analytics...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-2">User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowthData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-2">Event Participation</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventParticipationData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="participants" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded shadow col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-2">Sales</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesData} dataKey="sales" nameKey="month" cx="50%" cy="50%" outerRadius={80} label>
                  {salesData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalyticsDashboard 