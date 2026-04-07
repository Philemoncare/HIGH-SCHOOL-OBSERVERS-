import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // Add state for search, filter, pagination as needed

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        setLogs([]);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <>
      <Helmet>
        <title>Audit Logs - HSO Admin</title>
      </Helmet>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-red-800">Audit Logs</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-red-800 border-b">
                <th className="py-2 px-4">User</th>
                <th className="py-2 px-4">Action</th>
                <th className="py-2 px-4">Resource</th>
                <th className="py-2 px-4">Details</th>
                <th className="py-2 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No audit logs found.</td></tr>
              ) : logs.map(log => (
                <tr key={log._id} className="border-b hover:bg-red-50 transition">
                  <td className="py-2 px-4">{log.user_id || '-'}</td>
                  <td className="py-2 px-4">{log.action}</td>
                  <td className="py-2 px-4">{log.resource}</td>
                  <td className="py-2 px-4"><pre className="whitespace-pre-wrap text-xs bg-red-50 rounded p-2">{JSON.stringify(log.details, null, 2)}</pre></td>
                  <td className="py-2 px-4">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminAuditLogs; 