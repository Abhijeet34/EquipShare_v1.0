import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { requestAPI } from '../api';
import { RefreshIcon, SpinnerIcon, SearchIcon, MailIcon, ClipboardIcon } from '../components/Icons';
import styles from './Overdues.module.css';

// utils
const daysBetween = (a, b) => Math.max(0, Math.ceil((a - b) / (1000 * 60 * 60 * 24)));
const fmt = (d) => d ? new Date(d).toLocaleDateString() : '-';

function Overdues() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [minDays, setMinDays] = useState(0); // All | 7+ | 10+ | 30+

  const load = async (fromButton = false) => {
    if (fromButton || loading) setRefreshing(true);
    if (loading || !fromButton) setLoading(true);
    setError(null);
    try {
      const { data } = await requestAPI.getOverdue();
      setRows(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
      if (fromButton || loading) setTimeout(() => setRefreshing(false), 500);
    }
  };

  const markReturned = async (id) => {
    try {
      await requestAPI.updateStatus(id, 'returned');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => { load(); }, []);

  // derive request-level records with days overdue and item names
  const derived = useMemo(() => {
    const now = new Date();
    return (rows || []).map(r => {
      const overdueItems = (r.items || []).filter(i => ['overdue','approved'].includes(i.status) && new Date(i.returnDate) < now);
      if (overdueItems.length === 0) return null;
      const earliestDue = overdueItems.reduce((min, i) => {
        const d = new Date(i.returnDate);
        return d < min ? d : min;
      }, new Date(overdueItems[0].returnDate));
      const days = daysBetween(now, earliestDue);
      return {
        _id: r._id,
        requestId: r.requestId || r._id,
        borrowerName: r.user?.name || 'Unknown',
        borrowerEmail: r.user?.email || '-',
        borrowDate: r.borrowDate ? new Date(r.borrowDate) : null,
        items: overdueItems,
        itemNames: overdueItems.map(i => (i.equipment?.name || i.equipmentName || '')).join(', '),
        daysOverdue: days,
      };
    }).filter(Boolean).sort((a,b) => b.daysOverdue - a.daysOverdue);
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return derived.filter(r => r.daysOverdue >= minDays && (
      !q ||
      r.borrowerName.toLowerCase().includes(q) ||
      r.borrowerEmail.toLowerCase().includes(q) ||
      String(r.requestId).toLowerCase().includes(q) ||
      r.itemNames.toLowerCase().includes(q)
    ));
  }, [derived, query, minDays]);

  // actions
  const exportCsv = () => {
    const header = ['Request ID','Borrower','Email','Item','Qty','Due Date','Days Overdue'];
    const lines = filtered.flatMap(r => r.items.map(i => [
      r.requestId,
      JSON.stringify(r.borrowerName),
      r.borrowerEmail,
      JSON.stringify(i.equipment?.name || i.equipmentName || ''),
      i.quantity,
      fmt(i.returnDate),
      r.daysOverdue,
    ].join(',')));
    const blob = new Blob([[header.join(',')].concat(lines).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `overdues-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyEmails = async () => {
    const emails = Array.from(new Set(filtered.map(r => r.borrowerEmail))).filter(Boolean).join(', ');
    await navigator.clipboard.writeText(emails);
    alert('Borrower emails copied to clipboard');
  };

  const remind = async (r) => {
    if (!r._id) {
      alert('Request ID not found');
      return;
    }

    if (window.confirm(`Send reminder email to ${r.borrowerName} (${r.borrowerEmail})?`)) {
      try {
        const response = await requestAPI.sendReminder(r._id);
        if (response.data.success) {
          alert(`✓ Reminder sent successfully to ${r.borrowerEmail}`);
        }
      } catch (e) {
        const errorMsg = e.response?.data?.message || e.message;
        alert(`Failed to send reminder: ${errorMsg}`);
        setError(errorMsg);
      }
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', minHeight: 'calc(100vh - 200px)' }}>
      <div className="card">
        <div className={styles.headerBar}>
          <div className={styles.titleWrap}>
            <h2 className="page-title" style={{ margin: 0 }}>Overdue Returns</h2>
            <p className={styles.subtitle}>Prioritize follow-ups, send reminders, and clear returns efficiently.</p>
          </div>
          <div className={styles.actionsWrap}>
            <button className="btn btn-outline btn-header" onClick={() => load(true)} disabled={refreshing}>
              {refreshing ? <SpinnerIcon className="icon-sm" /> : <RefreshIcon className="icon-sm" />}
              <span style={{ marginLeft: 6 }}>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
            </button>
            {filtered.length > 0 && (
              <>
                <button className="btn btn-outline btn-header" onClick={exportCsv}>
                  <ClipboardIcon className="icon-sm" />
                  <span style={{ marginLeft: 6 }}>Export CSV</span>
                </button>
                <button className="btn btn-primary btn-header" onClick={copyEmails}>
                  <MailIcon className="icon-sm" />
                  <span style={{ marginLeft: 6 }}>Copy emails</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className={styles.controls}>
          <div className={styles.search}>
            <SearchIcon className={`icon ${styles.searchIcon}`} />
            <input
              placeholder="Search borrower, request ID, or item…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.segment} role="group" aria-label="Overdue range">
            {[0,7,10,30].map((d) => (
              <button key={d} className={d===minDays ? 'active' : ''} onClick={() => setMinDays(d)}>
                {d === 0 ? 'All' : `${d}+ days`}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {loading && <div className="loading"><SpinnerIcon className="icon" /> Loading…</div>}
          {error && <div className="alert alert-error">{error}</div>}
          {!loading && rows.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className={styles.emptyStateTitle}>All clear!</h3>
              <p className={styles.emptyStateMessage}>
                You have no overdue returns at the moment. Great job keeping everything on track.
              </p>
              <div className={styles.emptyStateActions}>
                <Link className="btn btn-outline" to="/requests">Go to Requests</Link>
                <Link className="btn btn-outline" to="/admin/analytics">Open Analytics</Link>
              </div>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Borrower</th>
                    <th>Items (overdue)</th>
                    <th>Qty</th>
                    <th>Due date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r._id}>
                      <td>{r.requestId}</td>
                      <td>
                        <div>{r.borrowerName}</div>
                        {r.borrowerEmail && (
                          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{r.borrowerEmail}</div>
                        )}
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                          {r.items.map((i, idx) => (
                            <li key={idx}>{i.equipment?.name || i.equipmentName}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                          {r.items.map((i, idx) => (
                            <li key={idx}>{i.quantity}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                          {r.items.map((i, idx) => {
                            const due = i.returnDate ? new Date(i.returnDate) : null;
                            const days = due ? daysBetween(new Date(), due) : 0;
                            return (
                              <li key={idx}>
                                {fmt(i.returnDate)}
                                {due && (
                                  <span style={{ color: '#b91c1c', marginLeft: 6 }}>
                                    ({days} day{days === 1 ? '' : 's'} overdue)
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button className="btn btn-outline" onClick={() => remind(r)}>Remind</button>
                          <button className="btn btn-primary" onClick={() => markReturned(r._id)}>Mark Returned</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overdues;
