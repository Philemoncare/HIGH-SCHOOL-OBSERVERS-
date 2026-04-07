import { useState, useEffect, useMemo } from 'react';
import BackButton from '../components/BackButton';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminLeadershipModal from '../components/AdminLeadershipModal';
import AdminLeadershipTable from '../components/AdminLeadershipTable';

function AdminLeadership() {
  const { token: adminToken } = useAdminAuth();
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('all'); // 'all' | 'featured' | 'normal'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  const getAuthConfig = () => {
    const token = adminToken || localStorage.getItem('admin_token');
    return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
  };

  const fetchLeadership = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/leadership/admin', getAuthConfig());
      setLeadership(response.data ?? []);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      setError('Error loading leadership team: ' + (msg || 'Failed to fetch leadership team'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadership();
  }, [adminToken]);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowModal(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leadership member?')) {
      return;
    }

    try {
      await axios.delete(`/api/leadership/${id}`, getAuthConfig());
      await fetchLeadership();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError('Error deleting leadership member: ' + msg);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingMember(null);
  };

  const handleModalSave = async () => {
    await fetchLeadership();
    handleModalClose();
  };

  const handleReorder = async (orderData) => {
    try {
      await axios.put('/api/leadership/reorder', { orderData }, {
        headers: { 'Content-Type': 'application/json', ...getAuthConfig().headers }
      });
      await fetchLeadership();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError('Error reordering leadership team: ' + msg);
    }
  };

  const filteredLeadership = useMemo(() => {
    let list = [...leadership];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(m =>
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.slug && m.slug.toLowerCase().includes(q)) ||
        (m.bio && m.bio.toLowerCase().includes(q))
      );
    }
    if (filterFeatured === 'featured') list = list.filter(m => m.is_featured);
    if (filterFeatured === 'normal') list = list.filter(m => !m.is_featured);
    if (filterStatus === 'active') list = list.filter(m => m.is_active);
    if (filterStatus === 'inactive') list = list.filter(m => !m.is_active);
    return list;
  }, [leadership, search, filterFeatured, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Leadership Management - Admin Dashboard</title>
      </Helmet>
      
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <BackButton
                  fallbackPath="/admin"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800 mb-3"
                >
                  Back to Dashboard
                </BackButton>
                <h1 className="text-3xl font-bold text-gray-800">Leadership Team Management</h1>
                <p className="text-gray-600 mt-2">Manage your organization's leadership team members</p>
              </div>
          <button
            onClick={handleAddMember}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Member
          </button>
            </div>
          {leadership.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, title, email, slug..."
                className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All members</option>
                <option value="featured">Featured only</option>
                <option value="normal">Not featured</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
          {leadership.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Leadership Members</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first leadership team member.</p>
              <button
                onClick={handleAddMember}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Member
              </button>
            </div>
          )}
          {leadership.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <AdminLeadershipTable
            leadership={filteredLeadership}
            totalCount={leadership.length}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            onReorder={handleReorder}
          />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <AdminLeadershipModal
          member={editingMember}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </>
  );
}

export default AdminLeadership; 