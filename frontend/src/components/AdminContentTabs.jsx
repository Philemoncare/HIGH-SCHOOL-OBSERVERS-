import { useState } from 'react'
import AdminNewsTable from './AdminNewsTable'
import AdminNewsModal from './AdminNewsModal'
import AdminEventsTable from './AdminEventsTable'
import AdminEventsModal from './AdminEventsModal'
import AdminShopTable from './AdminShopTable'
import AdminShopModal from './AdminShopModal'
import axios from 'axios'
import toast from 'react-hot-toast'

function AdminContentTabs({ news, events, shop, onAdd, onEdit, onDelete }) {
  // News modal state/handlers
  const [newsModalOpen, setNewsModalOpen] = useState(false)
  const [newsModalMode, setNewsModalMode] = useState('view')
  const [newsModalItem, setNewsModalItem] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const handleNewsAdd = () => { setNewsModalMode('add'); setNewsModalItem(null); setNewsModalOpen(true) }
  const handleNewsEdit = item => { setNewsModalMode('edit'); setNewsModalItem(item); setNewsModalOpen(true) }
  const handleNewsView = item => { setNewsModalMode('view'); setNewsModalItem(item); setNewsModalOpen(true) }
  const handleNewsDelete = async item => {
    if (window.confirm('Delete this news article?')) {
      setNewsLoading(true)
      try {
        await axios.delete(`/api/news/${item._id}`)
        toast.success('News deleted')
      } catch (err) {
        toast.error('Failed to delete news')
      } finally {
        setNewsLoading(false)
        window.location.reload()
      }
    }
  }
  const handleNewsSave = async form => {
    setNewsLoading(true)
    try {
      if (newsModalMode === 'add') {
        await axios.post('/api/news', form)
        toast.success('News added')
      } else if (newsModalMode === 'edit') {
        await axios.put(`/api/news/${newsModalItem._id}`, form)
        toast.success('News updated')
      }
      setNewsModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to save news')
    } finally {
      setNewsLoading(false)
    }
  }

  // Events modal state/handlers
  const [eventsModalOpen, setEventsModalOpen] = useState(false)
  const [eventsModalMode, setEventsModalMode] = useState('view')
  const [eventsModalItem, setEventsModalItem] = useState(null)
  const [eventsLoading, setEventsLoading] = useState(false)
  const handleEventsAdd = () => { setEventsModalMode('add'); setEventsModalItem(null); setEventsModalOpen(true) }
  const handleEventsEdit = item => { setEventsModalMode('edit'); setEventsModalItem(item); setEventsModalOpen(true) }
  const handleEventsView = item => { setEventsModalMode('view'); setEventsModalItem(item); setEventsModalOpen(true) }
  const handleEventsDelete = async item => {
    if (window.confirm('Delete this event?')) {
      setEventsLoading(true)
      try {
        await axios.delete(`/api/events/${item._id}`)
        toast.success('Event deleted')
      } catch (err) {
        toast.error('Failed to delete event')
      } finally {
        setEventsLoading(false)
        window.location.reload()
      }
    }
  }
  const handleEventsSave = async form => {
    setEventsLoading(true)
    try {
      if (eventsModalMode === 'add') {
        await axios.post('/api/events', form)
        toast.success('Event added')
      } else if (eventsModalMode === 'edit') {
        await axios.put(`/api/events/${eventsModalItem._id}`, form)
        toast.success('Event updated')
      }
      setEventsModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to save event')
    } finally {
      setEventsLoading(false)
    }
  }

  // Shop modal state/handlers
  const [shopModalOpen, setShopModalOpen] = useState(false)
  const [shopModalMode, setShopModalMode] = useState('view')
  const [shopModalItem, setShopModalItem] = useState(null)
  const [shopLoading, setShopLoading] = useState(false)
  const handleShopAdd = () => { setShopModalMode('add'); setShopModalItem(null); setShopModalOpen(true) }
  const handleShopEdit = item => { setShopModalMode('edit'); setShopModalItem(item); setShopModalOpen(true) }
  const handleShopView = item => { setShopModalMode('view'); setShopModalItem(item); setShopModalOpen(true) }
  const handleShopDelete = async item => {
    if (window.confirm('Delete this product?')) {
      setShopLoading(true)
      try {
        await axios.delete(`/api/shop/${item._id}`)
        toast.success('Product deleted')
      } catch (err) {
        toast.error('Failed to delete product')
      } finally {
        setShopLoading(false)
        window.location.reload()
      }
    }
  }
  const handleShopSave = async form => {
    setShopLoading(true)
    try {
      if (shopModalMode === 'add') {
        await axios.post('/api/shop', form)
        toast.success('Product added')
      } else if (shopModalMode === 'edit') {
        await axios.put(`/api/shop/${shopModalItem._id}`, form)
        toast.success('Product updated')
      }
      setShopModalOpen(false)
      window.location.reload()
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setShopLoading(false)
    }
  }

  const [tab, setTab] = useState('news')
  return (
    <div>
      <div className="flex gap-4 mb-4 border-b">
        <button className={`pb-2 ${tab==='news'?'border-b-2 border-blue-600 font-bold':''}`} onClick={()=>setTab('news')}>News</button>
        <button className={`pb-2 ${tab==='events'?'border-b-2 border-blue-600 font-bold':''}`} onClick={()=>setTab('events')}>Events</button>
        <button className={`pb-2 ${tab==='shop'?'border-b-2 border-blue-600 font-bold':''}`} onClick={()=>setTab('shop')}>Shop</button>
      </div>
      <div>
        {tab==='news' && (
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-bold">News</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleNewsAdd} disabled={newsLoading}>Add News</button>
            </div>
            <AdminNewsTable
              onView={handleNewsView}
              onEdit={handleNewsEdit}
              onDelete={handleNewsDelete}
            />
            <AdminNewsModal
              open={newsModalOpen}
              news={newsModalItem}
              onClose={()=>setNewsModalOpen(false)}
              onSave={handleNewsSave}
              mode={newsModalMode}
            />
            {newsLoading && <div className="text-center py-4 text-blue-600">Processing...</div>}
          </div>
        )}
        {tab==='events' && (
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-bold">Events</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEventsAdd} disabled={eventsLoading}>Add Event</button>
            </div>
            <AdminEventsTable
              onView={handleEventsView}
              onEdit={handleEventsEdit}
              onDelete={handleEventsDelete}
            />
            <AdminEventsModal
              open={eventsModalOpen}
              event={eventsModalItem}
              onClose={()=>setEventsModalOpen(false)}
              onSave={handleEventsSave}
              mode={eventsModalMode}
            />
            {eventsLoading && <div className="text-center py-4 text-blue-600">Processing...</div>}
          </div>
        )}
        {tab==='shop' && (
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="text-xl font-bold">Shop</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleShopAdd} disabled={shopLoading}>Add Product</button>
            </div>
            <AdminShopTable
              onView={handleShopView}
              onEdit={handleShopEdit}
              onDelete={handleShopDelete}
            />
            <AdminShopModal
              open={shopModalOpen}
              product={shopModalItem}
              onClose={()=>setShopModalOpen(false)}
              onSave={handleShopSave}
              mode={shopModalMode}
            />
            {shopLoading && <div className="text-center py-4 text-blue-600">Processing...</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminContentTabs 