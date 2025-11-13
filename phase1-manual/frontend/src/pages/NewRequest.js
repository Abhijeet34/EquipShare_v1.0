import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentAPI, requestAPI } from '../api';
import { FileTextIcon, BoxIcon, CalendarIcon, CheckCircleIcon, XIcon, AlertCircleIcon, SpinnerIcon, PlusIcon, TrashIcon, ShoppingCartIcon } from '../components/Icons';
import { SuccessMessage } from '../components/LoadingStates';

const NewRequest = () => {
  const [equipment, setEquipment] = useState([]);
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    borrowDate: '',
    reason: ''
  });
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const navigate = useNavigate();
  const MAX_REASON_LENGTH = 500;

  useEffect(() => {
    document.title = 'New Request - EquipShare';
    fetchEquipment();
    const today = getLocalDateString();
    setFormData(prev => ({ ...prev, borrowDate: today }));
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll({ available: 'true' });
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const addToCart = () => {
    if (!selectedEquipment) {
      setError('Please select an equipment item');
      return;
    }

    const equipmentItem = equipment.find(e => e._id === selectedEquipment);
    
    if (!equipmentItem) {
      setError('Selected equipment is no longer available');
      setSelectedEquipment('');
      return;
    }
    
    const existingItem = cart.find(item => item.equipment === selectedEquipment);
    if (existingItem) {
      setError('This item is already in your cart');
      return;
    }

    // Set return date to day after borrow date (or today + 1 if no borrow date set)
    const borrowDate = formData.borrowDate || getLocalDateString();
    const returnDate = new Date(borrowDate);
    returnDate.setDate(returnDate.getDate() + 1);
    const returnDateStr = getLocalDateString(returnDate);

    const newItem = {
      equipment: equipmentItem._id,
      equipmentName: equipmentItem.name,
      equipmentCategory: equipmentItem.category,
      availableCount: equipmentItem.available,
      quantity: 1,
      returnDate: returnDateStr
    };

    setCart([...cart, newItem]);
    setSelectedEquipment('');
    setError('');
  };

  const handleBorrowDateChange = (newBorrowDate) => {
    setFormData({ ...formData, borrowDate: newBorrowDate });
    
    // Update all cart items to have return dates after the new borrow date
    const borrowDate = new Date(newBorrowDate);
    const minReturnDate = new Date(borrowDate);
    minReturnDate.setDate(minReturnDate.getDate() + 1);
    const minReturnDateStr = getLocalDateString(minReturnDate);
    
    setCart(cart.map(item => {
      const itemReturnDate = new Date(item.returnDate);
      // If current return date is before or same as new borrow date, update it
      if (itemReturnDate <= borrowDate) {
        return { ...item, returnDate: minReturnDateStr };
      }
      return item;
    }));
  };

  const removeFromCart = (equipmentId) => {
    setCart(cart.filter(item => item.equipment !== equipmentId));
  };

  const updateCartItem = (equipmentId, field, value) => {
    // Validate quantity before updating
    if (field === 'quantity') {
      const cartItem = cart.find(item => item.equipment === equipmentId);
      if (cartItem) {
        const qty = parseInt(value);
        if (qty > cartItem.availableCount) {
          setError(`${cartItem.equipmentName}: Only ${cartItem.availableCount} unit(s) available`);
          return;
        }
        if (qty < 1) {
          setError(`${cartItem.equipmentName}: Quantity must be at least 1`);
          return;
        }
      }
    }
    
    setCart(cart.map(item => 
      item.equipment === equipmentId 
        ? { ...item, [field]: value }
        : item
    ));
    setError(''); // Clear error on successful update
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Please add at least one item to your cart');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const borrowDate = new Date(formData.borrowDate);
    borrowDate.setHours(0, 0, 0, 0);

    if (borrowDate < today) {
      setError('Borrow date cannot be in the past');
      return;
    }

    for (const item of cart) {
      const returnDate = new Date(item.returnDate);
      if (returnDate <= borrowDate) {
        setError(`${item.equipmentName}: Return date must be after borrow date`);
        return;
      }
    }

    setLoading(true);
    try {
      const requestData = {
        items: cart.map(item => ({
          equipment: item.equipment,
          quantity: parseInt(item.quantity),
          returnDate: item.returnDate
        })),
        borrowDate: formData.borrowDate,
        reason: formData.reason
      };

      console.log('Sending request data:', JSON.stringify(requestData, null, 2));
      console.log('Cart data:', JSON.stringify(cart, null, 2));
      const response = await requestAPI.create(requestData);
      setLoading(false);
      
      if (response.data.warnings && response.data.warnings.length > 0) {
        setError(`Request created with warnings: ${response.data.warnings.join(', ')}`);
      } else {
        setSuccess('Request submitted successfully');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate('/requests');
        }, 2000);
      }
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.errors 
        ? err.response.data.errors.join(', ')
        : err.response?.data?.message || 'Failed to create request';
      setError(errorMsg);
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, reason: value });
    setCharCount(value.length);
  };

  const availableEquipment = equipment.filter(
    e => !cart.find(item => item.equipment === e._id)
  );

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + parseInt(item.quantity || 0), 0);
  };

  // Get today's date in local timezone (YYYY-MM-DD format)
  const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <style>{`
        @keyframes subtleFade {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.6;
          }
        }
        .cart-icon-fade {
          animation: subtleFade 3s ease-in-out infinite;
        }
      `}</style>
      {showSuccess && (
        <SuccessMessage 
          message="Your equipment request has been submitted and is pending approval" 
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div style={{ 
        minHeight: 'calc(100vh - 80px)', 
        padding: '2.5rem 1.5rem', 
        background: 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)' 
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="icon-wrapper icon-wrapper-primary" style={{ 
              width: '64px', 
              height: '64px', 
              margin: '0 auto 1rem'
            }}>
              <ShoppingCartIcon className="icon-lg" />
            </div>
            <h1 style={{ 
              fontSize: '2.25rem', 
              fontWeight: '700', 
              color: '#0f172a',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em'
            }}>Create Equipment Request</h1>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              Build your request by adding equipment items with individual return dates
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '2rem',
              animation: 'slideDown 0.3s ease-out'
            }}>
              <AlertCircleIcon className="icon-md" />
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
            
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Add Equipment */}
              <div className="card" style={{ 
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <BoxIcon style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>
                    Add Equipment
                  </h2>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="form-control"
                    value={selectedEquipment}
                    onChange={(e) => setSelectedEquipment(e.target.value)}
                    style={{ 
                      flex: 1,
                      height: '44px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.95rem'
                    }}
                  >
                    <option value="">Select equipment to add...</option>
                    {availableEquipment.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} • {item.available} available
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addToCart}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      whiteSpace: 'nowrap',
                      height: '44px',
                      borderRadius: '8px',
                      padding: '0 1.5rem',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}
                    disabled={!selectedEquipment}
                  >
                    <PlusIcon className="icon-sm" />
                    Add to Cart
                  </button>
                </div>
                
                {availableEquipment.length === 0 && cart.length > 0 && (
                  <p style={{ 
                    marginTop: '1rem', 
                    padding: '0.75rem',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    color: '#475569', 
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    margin: '1rem 0 0 0'
                  }}>
                    All available equipment has been added to your cart
                  </p>
                )}
              </div>

              {/* Cart Items */}
              {cart.length > 0 && (
                <div className="card" style={{ 
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem', color: '#0f172a' }}>
                    Cart Items ({cart.length})
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {cart.map((item) => (
                      <div 
                        key={item.equipment} 
                        style={{ 
                          padding: '1.25rem',
                          background: '#f8fafc',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ 
                              fontSize: '1rem', 
                              fontWeight: '600', 
                              margin: '0 0 0.25rem 0',
                              color: '#0f172a'
                            }}>
                              {item.equipmentName}
                            </h3>
                            <p style={{ 
                              fontSize: '0.813rem', 
                              color: '#64748b', 
                              margin: 0 
                            }}>
                              {item.equipmentCategory} • Max available: {item.availableCount}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeFromCart(item.equipment)}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.35rem',
                              padding: '0.5rem 1rem',
                              fontSize: '0.875rem',
                              borderRadius: '6px'
                            }}
                          >
                            <TrashIcon className="icon-sm" />
                            Remove
                          </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem' }}>
                          <div>
                            <label className="form-label" style={{ 
                              fontSize: '0.813rem', 
                              fontWeight: '600',
                              marginBottom: '0.5rem',
                              display: 'block',
                              color: '#475569'
                            }}>
                              Quantity
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.equipment, 'quantity', e.target.value)}
                              min="1"
                              max={item.availableCount}
                              style={{ 
                                height: '40px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                textAlign: 'center'
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ 
                              fontSize: '0.813rem', 
                              fontWeight: '600',
                              marginBottom: '0.5rem',
                              display: 'block',
                              color: '#475569'
                            }}>
                              Return Date
                            </label>
                            <input
                              type="date"
                              className="form-control"
                              value={item.returnDate}
                              onChange={(e) => updateCartItem(item.equipment, 'returnDate', e.target.value)}
                              min={(() => {
                                const borrowDate = new Date(formData.borrowDate || getLocalDateString());
                                borrowDate.setDate(borrowDate.getDate() + 1);
                                return getLocalDateString(borrowDate);
                              })()}
                              required
                              style={{ 
                                height: '40px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.95rem'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Details */}
              <form onSubmit={handleSubmit}>
                <div className="card" style={{ 
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem', color: '#0f172a' }}>
                    Request Details
                  </h2>
                  
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#475569'
                    }}>
                      <CalendarIcon className="icon-sm" />
                      Borrow Date (Applies to all items)
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.borrowDate}
                      onChange={(e) => handleBorrowDateChange(e.target.value)}
                      min={getLocalDateString()}
                      required
                      style={{
                        height: '44px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.95rem'
                      }}
                    />
                    <small style={{ 
                      color: '#10b981', 
                      fontSize: '0.813rem', 
                      marginTop: '0.5rem', 
                      display: 'block',
                      fontWeight: '500'
                    }}>
                      ✓ Return dates will automatically adjust if needed
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#475569'
                      }}>
                        <FileTextIcon className="icon-sm" />
                        Reason for Request
                      </span>
                      <span style={{ 
                        fontSize: '0.813rem', 
                        color: charCount > MAX_REASON_LENGTH ? '#ef4444' : '#64748b',
                        fontWeight: '600'
                      }}>
                        {charCount}/{MAX_REASON_LENGTH}
                      </span>
                    </label>
                    <textarea
                      className="form-control"
                      value={formData.reason}
                      onChange={handleReasonChange}
                      rows="4"
                      minLength="10"
                      maxLength={MAX_REASON_LENGTH}
                      placeholder="Provide a detailed explanation for why you need this equipment..."
                      required
                      style={{
                        resize: 'vertical',
                        minHeight: '120px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.95rem',
                        lineHeight: '1.6'
                      }}
                    />
                    {charCount < 10 && charCount > 0 && (
                      <small style={{ 
                        color: '#f59e0b', 
                        fontSize: '0.813rem', 
                        marginTop: '0.5rem', 
                        display: 'block',
                        fontWeight: '500'
                      }}>
                        Please enter at least {10 - charCount} more character{10 - charCount !== 1 ? 's' : ''}
                      </small>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  marginTop: '1.5rem',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/equipment')}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      height: '44px',
                      padding: '0 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600'
                    }}
                  >
                    <XIcon className="icon-sm" />
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      height: '44px',
                      padding: '0 2rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      minWidth: '160px',
                      justifyContent: 'center'
                    }}
                    disabled={loading || cart.length === 0}
                  >
                    {loading ? (
                      <>
                        <SpinnerIcon className="icon-sm icon-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="icon-sm" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Cart Summary */}
            <div style={{ position: 'sticky', top: '1.5rem' }}>
              <div className="card" style={{ 
                background: '#fff',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingCartIcon style={{ width: '22px', height: '22px', strokeWidth: '2', color: '#475569' }} />
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: '#0f172a' }}>
                    Cart Summary
                  </h2>
                </div>
                
                {cart.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem 1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: '2px dashed #e5e7eb'
                  }}>
                    <ShoppingCartIcon 
                      className="cart-icon-fade"
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        margin: '0 auto 1rem', 
                        display: 'block',
                        color: '#cbd5e1'
                      }} 
                    />
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.95rem',
                      color: '#64748b',
                      lineHeight: '1.6',
                      fontWeight: '500'
                    }}>
                      Your cart is empty<br />
                      <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Add equipment to get started</span>
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ 
                      background: '#f8fafc',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      border: '1px solid #e5e7eb'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Equipment Types</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0ea5e9' }}>{cart.length}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>Total Items</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0ea5e9' }}>{getTotalItems()}</span>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.5rem'
                    }}>
                      {cart.map((item) => (
                        <div 
                          key={item.equipment} 
                          style={{ 
                            padding: '0.875rem 1rem',
                            background: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <span style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            flex: 1,
                            color: '#0f172a'
                          }}>
                            {item.equipmentName}
                          </span>
                          <span style={{ 
                            fontSize: '1rem', 
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                            color: '#fff',
                            padding: '0.375rem 0.875rem',
                            borderRadius: '6px',
                            minWidth: '50px',
                            textAlign: 'center'
                          }}>
                            {item.quantity}×
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ 
                  marginTop: '1rem',
                  padding: '1.25rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontSize: '0.813rem', color: '#0c4a6e', lineHeight: '1.7' }}>
                    <p style={{ margin: '0 0 0.625rem 0', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                      <CheckCircleIcon className="icon-sm" style={{ marginTop: '0.1rem', flexShrink: 0, color: '#0ea5e9' }} />
                      <span style={{ fontWeight: '500' }}>Review quantities and return dates</span>
                    </p>
                    <p style={{ margin: 0, display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                      <CheckCircleIcon className="icon-sm" style={{ marginTop: '0.1rem', flexShrink: 0, color: '#0ea5e9' }} />
                      <span style={{ fontWeight: '500' }}>All items share the same borrow date</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default NewRequest;
