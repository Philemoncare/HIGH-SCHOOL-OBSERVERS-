import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminEventsTable({ events, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) ||
                         event.description.toLowerCase().includes(search.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = !statusFilter || event.status === statusFilter
    const matchesCategory = !categoryFilter || event.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDelete = async (event) => {
    if (!window.confirm(`Are you sure you want to delete "${event.title}"? This cannot be undone.`)) return
    try {
      await onDelete(event._id)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to delete event'
      toast.error(msg)
    }
  }

  const handleToggleStatus = async (event) => {
    try {
      await onToggleStatus(event._id);
    } catch (err) {
      toast.error('Failed to update event status');
    }
  };

  const handleToggleFeatured = async (event) => {
    try {
      await onToggleFeatured(event._id);
    } catch (err) {
      toast.error('Failed to update event featured status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.draft}`}>
        {status}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const badges = {
      conference: 'bg-blue-100 text-blue-800',
      workshop: 'bg-green-100 text-green-800',
      symposium: 'bg-purple-100 text-purple-800',
      briefing: 'bg-orange-100 text-orange-800',
      networking: 'bg-pink-100 text-pink-800',
      summit: 'bg-indigo-100 text-indigo-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Categories</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="symposium">Symposium</option>
            <option value="briefing">Briefing</option>
            <option value="networking">Networking</option>
            <option value="summit">Summit</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6 pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <tr key={event._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={event.image || 'https://via.placeholder.com/48x48?text=Event'}
                        alt={event.title}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.organizer}
                      </div>
                      {event.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoryBadge(event.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(event.date)}</div>
                  <div className="text-sm text-gray-500">{event.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(event.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center justify-start gap-2 pr-4">
                    <button
                      onClick={() => onView(event)}
                      className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 rounded-lg border border-transparent hover:border-blue-200"
                      title="View Event"
                    >
                      <span className="text-lg">👁️</span>
                    </button>
                    <button
                      onClick={() => onEdit(event)}
                      className="flex-shrink-0 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200 rounded-lg border border-transparent hover:border-green-200"
                      title="Edit Event"
                    >
                      <span className="text-lg">✏️</span>
                    </button>
                    <button
                      onClick={() => onToggleStatus(event._id)}
                      className={`flex-shrink-0 p-2 transition-all duration-200 rounded-lg border border-transparent ${
                        event.status === 'active' 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                          : 'text-green-600 hover:text-green-800 hover:bg-green-50 hover:border-green-200'
                      }`}
                      title={event.status === 'active' ? 'Pause Event' : 'Activate Event'}
                    >
                      <span className="text-lg">{event.status === 'active' ? '⏸️' : '▶️'}</span>
                    </button>
                    <button
                      onClick={() => onToggleFeatured(event._id)}
                      className={`flex-shrink-0 p-2 transition-all duration-200 rounded-lg border border-transparent ${
                        event.featured 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 hover:border-yellow-200' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:border-gray-200'
                      }`}
                      title={event.featured ? 'Remove from Featured' : 'Mark as Featured'}
                    >
                      <span className="text-lg">{event.featured ? '⭐' : '☆'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(event)}
                      className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200 rounded-lg border border-transparent hover:border-red-200"
                      title="Delete Event"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default AdminEventsTable 