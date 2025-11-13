import React, { useState, useEffect, useRef } from 'react';
import { equipmentAPI } from '../api';
import { SettingsIcon, DatabaseIcon, PlusCircleIcon, EditIcon, TrashIcon, CheckIcon, XIcon, BoxIcon, TagIcon, LayersIcon, HashIcon, SpinnerIcon } from '../components/Icons';
import { SuccessMessage } from '../components/LoadingStates';

const AdminPanel = ({ user }) => {
  const [equipment, setEquipment] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sports',
    condition: 'Good',
    quantity: 1,
    description: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Manage Equipment - EquipShare';
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll({});
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      if (editId) {
        await equipmentAPI.update(editId, formData);
        setSuccessMessage('Equipment updated successfully');
      } else {
        await equipmentAPI.create(formData);
        setSuccessMessage('New equipment added to inventory');
      }
      resetForm();
      await fetchEquipment(); // Wait for fetch to complete
      setLoading(false);
      setShowSuccess(true);
      // Auto-hide success message
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setLoading(false);
      setMessage('Error: ' + (error.response?.data?.message || 'Operation failed'));
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category,
      condition: item.condition,
      quantity: item.quantity,
      description: item.description || ''
    });
    setEditId(item._id);
    setShowForm(true);
    // Scroll to form after a brief delay to ensure it's rendered
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await equipmentAPI.delete(id);
        await fetchEquipment(); // Wait for fetch to complete
        setSuccessMessage('Equipment removed from inventory');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        setMessage('Error: ' + (error.response?.data?.message || 'Delete failed'));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Sports',
      condition: 'Good',
      quantity: 1,
      description: ''
    });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <>
      {showSuccess && (
        <SuccessMessage 
          message={successMessage} 
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem', minHeight: 'calc(100vh - 280px)' }}>
        <div className="equipment-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="icon-wrapper icon-wrapper-primary">
              <SettingsIcon className="icon-lg" />
            </div>
            <div>
              <h1 className="page-title" style={{ margin: 0 }}>Equipment Management</h1>
              <p className="page-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Manage your equipment inventory</p>
            </div>
          </div>
          <button
            className="btn btn-primary btn-header"
            onClick={() => setShowForm(!showForm)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {showForm ? (
              <>
                <XIcon className="icon-sm" />
                Cancel
              </>
            ) : (
              <>
                <PlusCircleIcon className="icon-sm" />
                Add Equipment
              </>
            )}
          </button>
        </div>

      {message && (
        <div className={`alert ${message.startsWith('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div ref={formRef} className="card mb-4" style={{ scrollMarginTop: '2rem' }}>
          <h2>{editId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BoxIcon className="icon-sm" />
                  Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  minLength="2"
                  maxLength="100"
                  pattern="[A-Za-z0-9\s\-.,()]+"
                  title="Equipment name should contain letters, numbers, spaces, and basic punctuation (min 2, max 100 characters)"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TagIcon className="icon-sm" />
                  Category
                </label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Sports">Sports</option>
                  <option value="Lab">Lab</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Musical">Musical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayersIcon className="icon-sm" />
                  Condition
                </label>
                <select
                  className="form-control"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <HashIcon className="icon-sm" />
                  Quantity
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                maxLength="500"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <SpinnerIcon className="icon-sm icon-spin" />
                    {editId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <CheckIcon className="icon-sm" />
                    {editId ? 'Update' : 'Create'}
                  </>
                )}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <XIcon className="icon-sm" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Quantity</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.condition}</td>
                <td>{item.quantity}</td>
                <td>{item.available}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-start' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
                    >
                      <EditIcon className="icon-sm" />
                      Edit
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(item._id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
                      >
                        <TrashIcon className="icon-sm" />
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
};

export default AdminPanel;
