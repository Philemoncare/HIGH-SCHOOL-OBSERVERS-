import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminExecTable from '../components/AdminExecTable'
import AdminExecModal from '../components/AdminExecModal'

function AdminSettings() {
  const [settings, setSettings] = useState({
    allowRegistrations: true,
    maintenanceMode: false,
    supportEmail: 'support@hso.com',
  })
  const [loading, setLoading] = useState(false)

  // Admin/Exec modal state
  const [execModalOpen, setExecModalOpen] = useState(false)
  const [execModalUser, setExecModalUser] = useState(null)
  const [execModalMode, setExecModalMode] = useState('add')

  const handleExecAdd = () => {
    setExecModalUser(null)
    setExecModalMode('add')
    setExecModalOpen(true)
  }
  const handleExecEdit = user => {
    setExecModalUser(user)
    setExecModalMode('edit')
    setExecModalOpen(true)
  }
  const handleExecDelete = async user => {
    if (window.confirm('Delete this admin/executive?')) {
      setLoading(true)
      try {
        await axios.delete(`/api/users/${user._id}`)
        toast.success('Admin/Executive deleted')
      } catch (err) {
        toast.error('Failed to delete admin/executive')
      } finally {
        setLoading(false)
        window.location.reload()
      }
    }
  }
  const handleExecSave = async form => {
    setLoading(true)
    try {
      if (execModalMode === 'add') {
        await axios.post('/api/users', form)
        toast.success('Admin/Executive added')
      } else if (execModalMode === 'edit') {
        await axios.put(`/api/users/${execModalUser._id}`, form)
        toast.success('Admin/Executive updated')
      }
      setExecModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to save admin/executive')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    const { name, type, checked, value } = e.target
    setSettings(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put('/api/admin/settings', settings)
      toast.success('Settings saved!')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async type => {
    setLoading(true)
    try {
      const endpoint = type === 'audit logs' ? '/api/admin/reports/audit-logs' : '/api/admin/reports/user-list'
      const res = await axios.get(endpoint, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type.replace(' ', '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download started!')
    } catch (err) {
      toast.error('Failed to download report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Settings & Reports - Admin | High School Observer</title>
      </Helmet>
      <div className="p-8 space-y-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Platform Settings</h2>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="allowRegistrations" checked={settings.allowRegistrations} onChange={handleChange} />
                Allow new user registrations
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                Maintenance mode
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium">Support Email</label>
              <input name="supportEmail" value={settings.supportEmail} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</button>
          </form>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Download Reports</h2>
          <div className="flex gap-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>handleDownload('audit logs')} disabled={loading}>Download Audit Logs</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={()=>handleDownload('user list')} disabled={loading}>Download User List</button>
          </div>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Admin & Executive Management</h2>
          <AdminExecTable
            onEdit={handleExecEdit}
            onDelete={handleExecDelete}
            onAdd={handleExecAdd}
          />
          <AdminExecModal
            open={execModalOpen}
            user={execModalUser}
            onClose={()=>setExecModalOpen(false)}
            onSave={handleExecSave}
            mode={execModalMode}
          />
        </div>
        {loading && <div className="text-center py-4 text-blue-600">Processing...</div>}
      </div>
    </>
  )
}

export default AdminSettings 