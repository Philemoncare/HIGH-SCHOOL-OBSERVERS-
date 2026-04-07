import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../contexts/AdminAuthContext';

function AdminLeadershipModal({ member, onClose, onSave }) {
  const { token: adminToken } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    slug: '',
    email: '',
    bio: '',
    image: '',
    avatar_emoji: '👤',
    social_links: {
      linkedin: '',
      twitter: '',
      email: '',
      website: ''
    },
    order: 0,
    is_active: true,
    is_featured: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        title: member.title || '',
        slug: member.slug || '',
        email: member.email || '',
        bio: member.bio || '',
        image: member.image || '',
        avatar_emoji: member.avatar_emoji || '👤',
        social_links: {
          linkedin: member.social_links?.linkedin || '',
          twitter: member.social_links?.twitter || '',
          email: member.social_links?.email || '',
          website: member.social_links?.website || ''
        },
        order: member.order || 0,
        is_active: member.is_active !== undefined ? member.is_active : true,
        is_featured: !!member.is_featured
      });
      if (member.image) {
        setImagePreview(member.image);
      }
    } else {
      setError('');
    }
  }, [member]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('social_')) {
      const socialKey = name.replace('social_', '');
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim() || !formData.bio.trim()) {
      setError('Name, title, and bio are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Submitting leadership member data...');
      console.log('📝 Form data:', formData);

      // Prepare data for submission (normalize for API)
      const submitData = {
        name: formData.name?.trim() ?? '',
        title: formData.title?.trim() ?? '',
        slug: (formData.slug ?? '').trim() || undefined,
        email: (formData.email ?? '').trim() || undefined,
        bio: formData.bio?.trim() ?? '',
        image: formData.image || null,
        avatar_emoji: formData.avatar_emoji || '👤',
        social_links: {
          linkedin: (formData.social_links?.linkedin ?? '').trim() || undefined,
          twitter: (formData.social_links?.twitter ?? '').trim() || undefined,
          email: (formData.social_links?.email ?? '').trim() || undefined,
          website: (formData.social_links?.website ?? '').trim() || undefined,
        },
        order: Number(formData.order) || 0,
        is_active: !!formData.is_active,
        is_featured: !!formData.is_featured,
      };

      // If we have a new image file, convert it to base64
      if (imageFile) {
        setUploadingImage(true);
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(imageFile);
        });
        submitData.image = base64;
        setUploadingImage(false);
      }

      const url = member ? `/api/leadership/${member._id}` : '/api/leadership';
      const method = member ? 'PUT' : 'POST';
      
      console.log('🌐 Making API request:', method, url);
      console.log('📤 Request data:', submitData);

      const token = adminToken || localStorage.getItem('admin_token');
      const response = await axios({
        method,
        url,
        data: submitData,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      console.log('✅ API response:', response.data);

      if (response.data) {
        toast.success(member ? 'Member updated successfully!' : 'Member added successfully!');
        onSave();
      } else {
        throw new Error('No response data received');
      }
    } catch (error) {
      console.error('❌ Leadership member save error:', error);
      console.error('🔍 Error response:', error.response?.data);
      console.error('📊 Error status:', error.response?.status);
      
      let errorMessage = 'Failed to save leadership member';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.response?.status === 404) {
        errorMessage = 'API endpoint not found.';
      } else if (error.response?.status === 409) {
        errorMessage = error.response?.data?.message || 'A leadership member with this name and title (or email) already exists.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.error || error.response?.data?.message) {
        const msg = error.response.data.error || error.response.data.message;
        const details = error.response.data.details;
        errorMessage = details ? `${msg}: ${details}` : msg;
      }
      
      setError(errorMessage);
      // Single toast per error (same id prevents stacking)
      toast.error(errorMessage, { id: 'leadership-save-error', duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const emojiOptions = [
    '👤', '👨‍🏫', '👩‍🏫', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', 
    '👨‍⚕️', '👩‍⚕️', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {member ? 'Edit Leadership Member' : 'Add Leadership Member'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 shadow-sm">
              <span className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600" aria-hidden>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <div>
                <p className="font-semibold text-red-900">Couldn't save member</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter position/title"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL slug (optional, unique)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                placeholder="e.g. john-doe (lowercase, numbers and hyphens only)"
              />
              <p className="mt-1 text-xs text-gray-500">Used for /leadership/by-slug/… — leave blank to skip</p>
              <button
                type="button"
                onClick={() => {
                  const from = (formData.name || '').trim();
                  if (!from) return;
                  const suggested = from.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  setFormData(prev => ({ ...prev, slug: suggested }));
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Generate from name
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional, unique)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contact email (must be unique)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Enter member's bio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) { handleImageUpload({ target: { files: [e.dataTransfer.files[0]] } }); } }}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-32 object-cover rounded-full shadow"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 mb-2">
                      <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Choose File
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Links
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  name="social_linkedin"
                  value={formData.social_links.linkedin}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="LinkedIn URL"
                />
                <input
                  type="url"
                  name="social_twitter"
                  value={formData.social_links.twitter}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Twitter URL"
                />
                <input
                  type="email"
                  name="social_email"
                  value={formData.social_links.email}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Email address"
                />
                <input
                  type="url"
                  name="social_website"
                  value={formData.social_links.website}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Personal website"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                placeholder="0"
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active (visible on website)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Featured (highlight on public page)
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {(loading || uploadingImage) && (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {uploadingImage ? 'Uploading...' : (member ? 'Update Member' : 'Add Member')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLeadershipModal; 