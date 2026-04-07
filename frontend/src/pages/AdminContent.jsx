import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import AdminContentTabs from '../components/AdminContentTabs'

function AdminContent() {
  const [modalType, setModalType] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState(null)

  const handleAdd = type => {
    setModalType(type)
    setModalContent(null)
    setModalOpen(true)
  }
  const handleEdit = (type, item) => {
    setModalType(type)
    setModalContent(item)
    setModalOpen(true)
  }
  const handleDelete = (type, item) => {
    if (window.confirm(`Delete this ${type}?`)) {
      // TODO: API call to delete
    }
  }

  return (
    <>
      <Helmet>
        <title>Content Management - Admin | High School Observer</title>
      </Helmet>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Content Management</h2>
        <div className="bg-white p-6 rounded shadow">
          <AdminContentTabs
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  )
}

export default AdminContent 