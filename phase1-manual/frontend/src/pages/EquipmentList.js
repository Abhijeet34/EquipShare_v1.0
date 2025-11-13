import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentAPI, notificationAPI } from '../api';
import { BoxIcon, SearchIcon, FilterIcon, PlusCircleIcon, SpinnerIcon, TagIcon, HashIcon, LayersIcon, PackageIcon, ElectronicsIcon, LabEquipmentIcon, MusicalIcon, SportsIcon, BellIcon } from '../components/Icons';

const EquipmentList = ({ user }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [subscriptions, setSubscriptions] = useState({});
  const [subscribing, setSubscribing] = useState({});
  const navigate = useNavigate();

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'electronics':
        return ElectronicsIcon;
      case 'lab':
        return LabEquipmentIcon;
      case 'musical':
        return MusicalIcon;
      case 'sports':
        return SportsIcon;
      default:
        return PackageIcon;
    }
  };

  useEffect(() => {
    fetchEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, showOutOfStock]);

  const fetchEquipment = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      // Only filter by availability if NOT showing out of stock
      if (!showOutOfStock) {
        params.available = 'true';
      }

      const response = await equipmentAPI.getAll(params);
      let equipmentData = response.data.data;
      
      // Client-side smart sorting for better UX
      equipmentData = equipmentData.sort((a, b) => {
        // Priority 1: Available items first, then out-of-stock
        const aInStock = a.available > 0;
        const bInStock = b.available > 0;
        if (aInStock !== bInStock) return bInStock - aInStock;
        
        // Priority 2: Within in-stock items, sort by stock level (high to low)
        if (aInStock && bInStock) {
          const stockDiff = b.available - a.available;
          if (stockDiff !== 0) return stockDiff;
        }
        
        // Priority 3: Alphabetically by name
        return a.name.localeCompare(b.name);
      });
      
      setEquipment(equipmentData);
      
      // Fetch subscription status if user is logged in
      if (user && equipmentData.length > 0) {
        try {
          const equipmentIds = equipmentData.map(e => e._id);
          const subResponse = await notificationAPI.bulkCheck(equipmentIds);
          setSubscriptions(subResponse.data.data || {});
        } catch (err) {
          console.error('Error fetching subscriptions:', err);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setLoading(false);
    }
  };
  
  const handleNotifyMe = async (equipmentId, isSubscribed) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setSubscribing(prev => ({ ...prev, [equipmentId]: true }));
    
    try {
      if (isSubscribed) {
        await notificationAPI.unsubscribe(equipmentId);
        setSubscriptions(prev => ({ ...prev, [equipmentId]: false }));
      } else {
        await notificationAPI.subscribe(equipmentId);
        setSubscriptions(prev => ({ ...prev, [equipmentId]: true }));
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
    } finally {
      setSubscribing(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  if (loading) return (
    <div className="loading">
      <SpinnerIcon className="icon-lg" />
      <span>Loading equipment...</span>
    </div>
  );

  return (
    <div className="container equipment-page">
      <div className="equipment-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-wrapper icon-wrapper-primary">
            <BoxIcon className="icon-lg" />
          </div>
          <div>
            <h1 className="page-title">Available Equipment</h1>
            <p className="page-subtitle">Browse and request equipment from our inventory</p>
          </div>
        </div>
        {user ? (
          <button className="btn btn-primary btn-header" onClick={() => navigate('/request/new')}>
            <PlusCircleIcon className="icon-sm" style={{ marginRight: '0.5rem' }} />
            New Request
          </button>
        ) : (
          <button className="btn btn-primary btn-header" onClick={() => navigate('/login')}>
            Login to Request
          </button>
        )}
      </div>

      <div className="equipment-search-card">
        <div className="search-controls">
          <div className="form-group">
            <div className="input-with-icon">
              <SearchIcon className="icon-md input-icon" />
              <input
                type="text"
                className="form-control form-control-modern"
                placeholder="Search equipment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                maxLength="100"
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon">
              <FilterIcon className="icon-md input-icon" />
              <select
                className="form-control form-control-modern"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Sports">Sports</option>
                <option value="Lab">Lab</option>
                <option value="Electronics">Electronics</option>
                <option value="Musical">Musical</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#475569', fontWeight: '500' }}>
            <input
              type="checkbox"
              checked={showOutOfStock}
              onChange={(e) => setShowOutOfStock(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            Show out-of-stock items
          </label>
          
          {user && (user.role === 'admin' || user.role === 'staff') && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.5rem 1rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.813rem', color: '#64748b', fontWeight: '600' }}>Stock Levels:</span>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>●</span>
                  <span style={{ fontSize: '0.813rem', color: '#475569' }}>Healthy (≥3)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#f59e0b' }}>●</span>
                  <span style={{ fontSize: '0.813rem', color: '#475569' }}>Low (&lt;3)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444' }}>●</span>
                  <span style={{ fontSize: '0.813rem', color: '#475569' }}>Reserved (0)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="equipment-grid">
        {equipment.map((item, index) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const isOutOfStock = item.available === 0;
          return (
          <div 
            key={item._id} 
            className="equipment-card" 
            style={{ 
              animationDelay: `${index * 0.1}s`,
              opacity: isOutOfStock ? 0.5 : 1,
              border: isOutOfStock ? '2px dashed #cbd5e1' : '1px solid #e5e7eb',
              backgroundColor: isOutOfStock ? '#f8fafc' : '#ffffff',
              position: 'relative',
              filter: isOutOfStock ? 'grayscale(0.3)' : 'none'
            }}
          >
            {isOutOfStock && (
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                background: '#f1f5f9',
                color: '#64748b',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ fontSize: '0.7rem' }}>●</span> Reserved
              </div>
            )}
            <div className="equipment-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="icon-wrapper icon-wrapper-primary" style={{ padding: '0.5rem' }}>
                  <CategoryIcon className="icon-md" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="equipment-name">{item.name}</h3>
                  <span className="equipment-category" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TagIcon className="icon-sm" />
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
            <p className="equipment-description">{item.description}</p>
            <div className="equipment-card-footer">
              <div className="equipment-info">
                <LayersIcon className="icon-sm" style={{ marginRight: '0.25rem' }} />
                <span className="info-label">Condition:</span>
                <span className="info-value condition-{item.condition.toLowerCase()}">{item.condition}</span>
              </div>
              <div className="equipment-info">
                <HashIcon className="icon-sm" style={{ marginRight: '0.25rem' }} />
                <span className="info-label">Available:</span>
                <span 
                  className="info-value availability" 
                  style={{ 
                    color: item.available === 0 ? '#ef4444' : item.available < 3 ? '#f59e0b' : '#10b981',
                    fontWeight: '700'
                  }}
                >
                  {item.available}/{item.quantity}
                  {item.available === 0 && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>(All reserved)</span>}
                </span>
              </div>
            </div>
            
            {/* Notify Me button for out-of-stock items */}
            {isOutOfStock && user && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleNotifyMe(item._id, subscriptions[item._id])}
                  disabled={subscribing[item._id]}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1rem',
                    borderRadius: '8px',
                    border: subscriptions[item._id] ? '1px solid #10b981' : '1px solid #e2e8f0',
                    background: subscriptions[item._id] ? '#ecfdf5' : '#fff',
                    color: subscriptions[item._id] ? '#059669' : '#64748b',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: subscribing[item._id] ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: subscribing[item._id] ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => !subscribing[item._id] && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {subscribing[item._id] ? (
                    <SpinnerIcon className="icon-sm icon-spin" />
                  ) : (
                    <BellIcon className="icon-sm" />
                  )}
                  {subscriptions[item._id] ? 'Notifications On' : 'Notify When Available'}
                </button>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {equipment.length === 0 && (
        <div className="empty-state">
          <BoxIcon className="icon-xl icon-pulse" style={{ color: '#94a3b8', marginBottom: '1rem' }} />
          <p>No equipment found</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;
