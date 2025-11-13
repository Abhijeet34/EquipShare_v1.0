import React, { useState, useEffect } from 'react';
import { requestAPI } from '../api';
import { ListIcon, SpinnerIcon, CheckIcon, XIcon, XCircleIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, RefreshIcon } from '../components/Icons';

const RequestsList = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [expandedNote, setExpandedNote] = useState(null);
  const [expandedReason, setExpandedReason] = useState(null);

  useEffect(() => {
    document.title = 'My Requests - EquipShare';
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setRefreshing(true);
      const response = await requestAPI.getAll();
      setRequests(response.data.data);
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (id, status, reason = null) => {
    try {
      setUpdatingId(id);
      await requestAPI.updateStatus(id, status, reason);
      await fetchRequests();
      setUpdatingId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setUpdatingId(null);
    }
  };

  const handleRejectClick = (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    await handleStatusUpdate(selectedRequestId, 'rejected', rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedRequestId(null);
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedRequestId(null);
  };

  const handleApproveClick = (requestId) => {
    setSelectedRequestId(requestId);
    setShowApprovalModal(true);
  };

  const handleApproveSubmit = async () => {
    await handleStatusUpdate(selectedRequestId, 'approved', approvalNote || null);
    setShowApprovalModal(false);
    setApprovalNote('');
    setSelectedRequestId(null);
  };

  const handleApproveCancel = () => {
    setShowApprovalModal(false);
    setApprovalNote('');
    setSelectedRequestId(null);
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      case 'returned': return 'badge-returned';
      case 'expired': return 'badge-expired';
      case 'unavailable': return 'badge-rejected';
      default: return '';
    }
  };

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'Expiring soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const canTakeAction = (request) => {
    // Check if all items have equipment available
    if (request.items && request.items.length > 0) {
      return request.items.every(item => item.equipment);
    }
    return false;
  };

  if (loading) return (
    <div className="loading">
      <SpinnerIcon className="icon-lg" />
      <span>Loading requests...</span>
    </div>
  );

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-wrapper icon-wrapper-primary">
            <ListIcon className="icon-lg" />
          </div>
          <h1 style={{ margin: 0 }}>My Requests</h1>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={fetchRequests}
          disabled={refreshing}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s ease' }}
        >
          <RefreshIcon className={`icon-sm ${refreshing ? 'icon-spin' : ''}`} style={{ transition: 'transform 0.5s ease' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="card">
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <ClockIcon className="icon-xl icon-pulse" style={{ color: '#94a3b8', marginBottom: '1rem' }} />
            <p className="text-gray">No requests found</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Request ID</th>
                <th style={{ width: '240px' }}>Items</th>
                <th style={{ width: '130px' }}>Borrow Date</th>
                <th style={{ width: '140px' }}>Status</th>
                <th style={{ width: '200px' }}>Request Reason</th>
                <th style={{ width: '200px' }}>Status Notes</th>
                {(user.role === 'admin' || user.role === 'staff') && <th style={{ width: '200px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td style={{ width: '120px', fontFamily: 'monospace', fontSize: '0.875rem', color: '#1e293b', fontWeight: '600' }}>{request.requestId || `#${request._id.slice(-6)}`}</td>
                  <td style={{ width: '240px' }}>
                    {request.items && request.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {request.items.map((item, idx) => (
                          <div key={idx} style={{ 
                            padding: '0.5rem', 
                            background: '#f8fafc', 
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                              {item.equipmentName || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                              <div>Qty: {item.quantity}</div>
                              <div style={{ marginTop: '0.15rem' }}>
                                Expected Return: {new Date(item.returnDate).toLocaleDateString()}
                              </div>
                              {item.actualReturnDate && (() => {
                                const actualDate = new Date(item.actualReturnDate);
                                const expectedDate = new Date(item.returnDate);
                                // Normalize to compare dates only (ignore time)
                                actualDate.setHours(0, 0, 0, 0);
                                expectedDate.setHours(0, 0, 0, 0);
                                const diffTime = actualDate - expectedDate;
                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                
                                let statusText = '';
                                let statusColor = '#059669'; // default green
                                
                                if (diffDays > 0) {
                                  statusText = `(${diffDays} day${diffDays > 1 ? 's' : ''} late)`;
                                  statusColor = '#dc2626'; // red
                                } else if (diffDays < 0) {
                                  statusText = `(${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} early)`;
                                  statusColor = '#059669'; // green
                                } else {
                                  statusText = '(On Time)';
                                  statusColor = '#059669'; // green
                                }
                                
                                return (
                                  <div style={{ 
                                    marginTop: '0.15rem',
                                    color: statusColor,
                                    fontWeight: '500'
                                  }}>
                                    Actual Return: {new Date(item.actualReturnDate).toLocaleDateString()}
                                    <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>{statusText}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No items</span>
                    )}
                  </td>
                  <td style={{ width: '130px' }}>{new Date(request.borrowDate).toLocaleDateString()}</td>
                  <td style={{ width: '140px' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
                      <span className={`badge ${getBadgeClass(request.status)}`} style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.35rem',
                        width: 'fit-content',
                        whiteSpace: 'nowrap'
                      }}>
                        {request.status === 'pending' && <ClockIcon className="icon-sm icon-spin-slow" />}
                        {request.status === 'approved' && <CheckCircleIcon className="icon-sm icon-pulse" />}
                        {request.status === 'rejected' && <XCircleIcon className="icon-sm icon-wiggle" />}
                        {request.status === 'returned' && <CheckIcon className="icon-sm icon-subtle-pulse" />}
                        {request.status === 'expired' && <AlertCircleIcon className="icon-sm icon-fade-blink" />}
                        {request.status}
                      </span>
                      {request.status === 'pending' && request.expiresAt && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#f59e0b', 
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {getTimeRemaining(request.expiresAt)}
                        </span>
                      )}
                      {request.status === 'expired' && (
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#64748b', 
                          fontStyle: 'italic',
                          textAlign: 'center'
                        }}>
                          Auto-expired
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ width: '200px' }}>
                    {request.reason ? (
                      <div 
                        onClick={() => setExpandedReason(request._id)}
                        style={{ 
                          fontSize: '0.85rem', 
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#f8fafc'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e2e8f0';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        title="Click to view full reason"
                      >
                        {request.reason}
                        {request.reason.length > 50 && (
                          <span style={{ 
                            fontSize: '0.7rem', 
                            marginLeft: '0.25rem',
                            opacity: 0.7,
                            verticalAlign: 'super'
                          }}>📋</span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No reason provided</span>
                    )}
                  </td>
                  <td style={{ width: '200px' }}>
                    {(request.status === 'rejected' && request.rejectionReason) || 
                     (request.status === 'expired' && request.expiredReason) || 
                     (request.status === 'approved' && request.approvalNote) ? (
                      <div 
                        onClick={() => setExpandedNote(request._id)}
                        style={{ 
                          fontSize: '0.85rem', 
                          color: request.status === 'rejected' ? '#dc2626' : request.status === 'expired' ? '#f59e0b' : '#059669',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontStyle: 'italic',
                          fontWeight: '500',
                          backgroundColor: request.status === 'rejected' ? '#fef2f2' : request.status === 'expired' ? '#fffbeb' : '#d1fae5',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: `1px solid ${request.status === 'rejected' ? '#fecaca' : request.status === 'expired' ? '#fde68a' : '#6ee7b7'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        title="Click to view full message"
                      >
                        {request.status === 'rejected' ? request.rejectionReason : request.status === 'expired' ? request.expiredReason : request.approvalNote}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>—</span>
                    )}
                  </td>
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <td style={{ width: '200px' }}>
                      <div className="flex gap-2">
                        {request.status === 'pending' && canTakeAction(request) && (
                          <>
                            <button
                              className="btn btn-success"
                              onClick={() => handleApproveClick(request._id)}
                              disabled={updatingId === request._id}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.35rem', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={(e) => {
                                if (updatingId !== request._id) {
                                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '';
                              }}
                            >
                              {updatingId === request._id ? (
                                <SpinnerIcon className="icon-sm icon-spin" />
                              ) : (
                                <CheckIcon className="icon-sm" style={{ transition: 'transform 0.3s ease' }} />
                              )}
                              {updatingId === request._id ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleRejectClick(request._id)}
                              disabled={updatingId === request._id}
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.35rem', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                              onMouseEnter={(e) => {
                                if (updatingId !== request._id) {
                                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                                  const icon = e.currentTarget.querySelector('.icon-sm');
                                  if (icon && !icon.classList.contains('icon-spin')) icon.style.transform = 'rotate(90deg)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '';
                                const icon = e.currentTarget.querySelector('.icon-sm');
                                if (icon && !icon.classList.contains('icon-spin')) icon.style.transform = 'rotate(0deg)';
                              }}
                            >
                              {updatingId === request._id ? (
                                <SpinnerIcon className="icon-sm icon-spin" />
                              ) : (
                                <XIcon className="icon-sm" style={{ transition: 'transform 0.3s ease' }} />
                              )}
                            {updatingId === request._id ? 'Rejecting...' : 'Reject'}
                            </button>
                          </>
                        )}
                        {request.status === 'pending' && !canTakeAction(request) && (
                          <span className="text-gray" style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
                            Equipment no longer available
                          </span>
                        )}
                        {request.status === 'approved' && canTakeAction(request) && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStatusUpdate(request._id, 'returned')}
                            disabled={updatingId === request._id}
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.35rem',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                              if (updatingId !== request._id) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.5)';
                                const icon = e.currentTarget.querySelector('.icon-sm');
                                if (icon && !icon.classList.contains('icon-spin')) icon.style.transform = 'scale(1.2)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = '';
                              const icon = e.currentTarget.querySelector('.icon-sm');
                              if (icon && !icon.classList.contains('icon-spin')) icon.style.transform = 'scale(1)';
                            }}
                          >
                            {updatingId === request._id ? (
                              <SpinnerIcon className="icon-sm icon-spin" />
                            ) : (
                              <CheckCircleIcon className="icon-sm" style={{ transition: 'transform 0.3s ease' }} />
                            )}
                            {updatingId === request._id ? 'Updating...' : 'Mark Returned'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expanded Request Reason Modal */}
      {expandedReason && (() => {
        const request = requests.find(r => r._id === expandedReason);
        if (!request) return null;
        
        return (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setExpandedReason(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '1.25rem' }}>Request Reason</h2>
                <button
                  onClick={() => setExpandedReason(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '0.25rem',
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  ×
                </button>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                border: '2px solid #cbd5e1',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {request.reason}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#64748b',
                paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <span>Request ID: <strong>{request.requestId}</strong></span>
                <span>{request.reason.length} characters</span>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setExpandedReason(null)}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* Expanded Note Modal */}
      {expandedNote && (() => {
        const request = requests.find(r => r._id === expandedNote);
        if (!request) return null;
        const noteText = request.status === 'rejected' ? request.rejectionReason : 
                         request.status === 'expired' ? request.expiredReason : 
                         request.approvalNote;
        const noteType = request.status === 'rejected' ? 'Rejection Reason' : 
                        request.status === 'expired' ? 'Expiration Notice' : 
                        'Approval Note';
        const noteColor = request.status === 'rejected' ? '#dc2626' : 
                         request.status === 'expired' ? '#f59e0b' : 
                         '#059669';
        
        return (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setExpandedNote(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: noteColor, fontSize: '1.25rem' }}>{noteType}</h2>
                <button
                  onClick={() => setExpandedNote(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: '0.25rem',
                    lineHeight: 1
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#64748b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  ×
                </button>
              </div>
              <div style={{
                padding: '1rem',
                backgroundColor: request.status === 'rejected' ? '#fef2f2' : 
                                request.status === 'expired' ? '#fffbeb' : '#d1fae5',
                borderRadius: '8px',
                border: `2px solid ${request.status === 'rejected' ? '#fecaca' : 
                                     request.status === 'expired' ? '#fde68a' : '#6ee7b7'}`,
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: '#1e293b',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {noteText}
                </p>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: '#64748b',
                paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0'
              }}>
                <span>Request ID: <strong>{request.requestId}</strong></span>
                <span>{noteText.length} characters</span>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setExpandedNote(null)}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>Approve Request</h2>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>
              You can optionally add a note for the user (e.g., pickup instructions, conditions, etc.)
            </p>
            <div className="form-group">
              <label className="form-label">Approval Note (Optional)</label>
              <textarea
                className="form-control"
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="e.g., Please collect equipment from Room 101 between 9-5 PM"
                rows={4}
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
              <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {approvalNote.length}/500 characters
              </small>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleApproveCancel}
                disabled={updatingId !== null}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleApproveSubmit}
                disabled={updatingId !== null}
              >
                {updatingId ? 'Approving...' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#1e293b' }}>Reject Request</h2>
            <p style={{ marginBottom: '1rem', color: '#64748b' }}>
              Please provide a reason for rejecting this request. This will be visible to the user.
            </p>
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                className="form-control"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                maxLength={500}
                style={{ resize: 'vertical' }}
              />
              <small style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                {rejectionReason.length}/500 characters
              </small>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={handleRejectCancel}
                disabled={updatingId !== null}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleRejectSubmit}
                disabled={updatingId !== null || !rejectionReason.trim()}
              >
                {updatingId ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsList;
