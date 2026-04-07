import { useEffect, useState } from 'react'
import axios from 'axios'

function AdminMagazinesTable({ onView, onEdit }) {
  const [magazines, setMagazines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchMagazines() {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get('/api/magazine')
        let data = res.data
        if (search) {
          data = data.filter(m => m.title.toLowerCase().includes(search.toLowerCase()))
        }
        setMagazines(data.slice((page-1)*10, page*10))
        setTotalPages(Math.ceil(data.length/10) || 1)
      } catch (err) {
        setError('Failed to load magazines')
      } finally {
        setLoading(false)
      }
    }
    fetchMagazines()
  }, [search, page])

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this magazine issue?')) return;
    try {
      await axios.delete(`/api/magazine/${item._id}`);
      setMagazines(magazines => magazines.filter(m => m._id !== item._id));
    } catch (err) {
      alert('Failed to delete magazine')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search magazines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      {loading ? (
        <div className="text-center py-8">Loading magazines...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Issue #</th>
                <th className="px-4 py-2 border">Published</th>
                <th className="px-4 py-2 border">Featured</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {magazines.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No magazines found.</td></tr>
              ) : magazines.map(item => (
                <tr key={item._id}>
                  <td className="px-4 py-2 border">{item.title}</td>
                  <td className="px-4 py-2 border">{item.issue_number || '-'}</td>
                  <td className="px-4 py-2 border">{item.publish_date ? new Date(item.publish_date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-2 border">{item.is_featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button className="text-blue-600 hover:underline" onClick={() => onView(item)}>View</button>
                    <button className="text-green-600 hover:underline" onClick={() => onEdit(item)}>Edit</button>
                    <button className="text-red-700 font-bold hover:underline" onClick={() => handleDelete(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >Next</button>
      </div>
    </div>
  )
}

export default AdminMagazinesTable 