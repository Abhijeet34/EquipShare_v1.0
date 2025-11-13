import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart as RBarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsAPI } from '../api';
import { RefreshIcon } from '../components/Icons';
import styles from './Analytics.module.css';

// Enhanced Tooltip with contextual insights
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const color = entry.payload?.fill || entry.fill || entry.color;
    
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem}>
          <span style={{ color: color }}>●</span>
          <span><strong>{entry.value}</strong> {entry.name.toLowerCase()}</span>
        </div>
        {/* Add percentage if data exists */}
        {entry.payload?.total && (
          <div className={styles.tooltipItem} style={{ fontSize: '0.8rem', opacity: 0.9 }}>
            <span style={{ color: color }}>●</span>
            <span>{((entry.value / entry.payload.total) * 100).toFixed(1)}% of total</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Enhanced Tooltip with Business Insights for Pie Charts
const EnhancedPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    // Extract original color from payload, with multiple fallbacks
    // Priority: originalColor first (stored in data), then fill if it's not a gradient URL
    let color = data.payload?.originalColor || data.payload?.fill || '#6b7280';
    
    // Filter out gradient URLs
    if (color && color.startsWith('url(')) {
      color = data.payload?.originalColor || '#10b981'; // fallback to a visible color for debugging
    }
    
    const insight = data.payload?.insight || [];
    
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{data.name}</p>
        {insight && insight.length > 0 && (
          <>
            {insight.map((item, idx) => (
              <div key={idx} className={styles.tooltipItem} style={{ fontSize: '0.85rem' }}>
                <span style={{ color: color }}>●</span>
                <span>{item}</span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  }
  return null;
};

// Enhanced Tooltip for Bar Charts with Rich Insights
const EnhancedBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value;
    const total = data.payload.total || 0;
    // Use the actual bar color from the data
    const color = data.payload.barColor || data.payload.fill || data.fill || data.color;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    
    // Calculate average from all categories (need to access all data)
    const allData = payload[0]?.payload?._allData || [];
    const avgValue = allData.length > 0 
      ? allData.reduce((sum, item) => sum + item.requests, 0) / allData.length
      : value;
    
    const isHighPerforming = value > avgValue * 1.2;
    const isLowPerforming = value < avgValue * 0.8;
    
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel} style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{label}</p>
        <div className={styles.tooltipItem} style={{ fontSize: '0.9rem', fontWeight: '600' }}>
          <span style={{ color: color }}>●</span>
          <span>{value} {data.name?.toLowerCase() || 'requests'}</span>
        </div>
        <div className={styles.tooltipItem} style={{ fontSize: '0.85rem', opacity: 0.95 }}>
          <span style={{ color: color }}>●</span>
          <span>{percentage}% of total requests</span>
        </div>
        {isHighPerforming && (
          <div className={styles.tooltipItem} style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '500' }}>
            <span style={{ marginRight: '0.25rem' }}>↑</span>
            <span>High demand category</span>
          </div>
        )}
        {isLowPerforming && (
          <div className={styles.tooltipItem} style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: '500' }}>
            <span style={{ marginRight: '0.25rem' }}>↓</span>
            <span>Low demand category</span>
          </div>
        )}
        {!isHighPerforming && !isLowPerforming && (
          <div className={styles.tooltipItem} style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
            <span style={{ marginRight: '0.25rem' }}>•</span>
            <span>Average demand category</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// SVG Icons for KPI Cards
const KPIIcons = {
  requests: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  checkCircle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  clock: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  alert: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  activity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  timer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="2" x2="14" y2="2" />
      <line x1="12" y1="14" x2="15" y2="11" />
      <circle cx="12" cy="14" r="8" />
    </svg>
  )
};

// KPI Card Component with SVG icons
function KPICard({ title, value, color = 'primary', subtitle, icon }) {
  return (
    <div className={`${styles.kpiCard} ${styles[color]}`}>
      <div className={styles.kpiHeader}>
        <div>
          <div className={styles.kpiLabel}>{title}</div>
        </div>
        <div className={`${styles.kpiIcon} ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <div className={styles.kpiValue}>{value}</div>
      {subtitle && <div className={styles.kpiTrend}>{subtitle}</div>}
    </div>
  );
}

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = async (fromButton = false) => {
    if (fromButton || loading) setRefreshing(true);
    if (loading || !fromButton) setLoading(true);
    setError(null);
    try {
      const res = await analyticsAPI.getSummary();
      setData(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
      if (fromButton || loading) setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => { load(); }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      load();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const statusData = useMemo(() => {
    if (!data?.status) return [];
    const total = data.status.reduce((sum, s) => sum + s.count, 0);
    const totalRequests = data.kpis?.totalRequests || 0;
    return data.status.map(s => {
      const percentage = total > 0 ? ((s.count / total) * 100).toFixed(1) : 0;
      const lifetimePercentage = totalRequests > 0 ? ((s.count / totalRequests) * 100).toFixed(1) : 0;
      
      // Generate actionable insights - ensure all statuses have 2 lines with valuable metrics
      const insight = [];
      if (s._id === 'pending') {
        insight.push('Awaiting admin approval');
        const oldestDays = data.insights?.oldestPendingDays || 0;
        if (oldestDays > 0) {
          insight.push(`Oldest pending: ${oldestDays} day${oldestDays !== 1 ? 's' : ''}`);
        } else {
          insight.push('All recent requests');
        }
      } else if (s._id === 'approved') {
        insight.push('Equipment currently in use');
        insight.push(`${s.count} request${s.count !== 1 ? 's' : ''} active`);
      } else if (s._id === 'rejected') {
        insight.push('Declined by administrator');
        const rejectionRate = total > 0 ? ((s.count / total) * 100).toFixed(0) : 0;
        insight.push(`${rejectionRate}% rejection rate`);
      } else if (s._id === 'returned') {
        insight.push('✓ Successfully completed');
        insight.push(`${s.count} request${s.count !== 1 ? 's' : ''} fulfilled`);
      } else if (s._id === 'expired') {
        insight.push('Auto-expired requests');
        insight.push('Inventory released back');
      } else if (s._id === 'overdue') {
        insight.push('⚠ Past return date');
        insight.push('Requires immediate action');
      }
      
      const color = getStatusColor(s._id);
      return {
        name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
        value: s.count,
        fill: color,
        originalColor: color,
        totalValue: total,
        insight
      };
    });
  }, [data]);

  const monthlyData = useMemo(() => {
    if (!data?.monthly) return [];
    const total = data.monthly.reduce((sum, m) => sum + m.count, 0);
    return data.monthly.map(m => ({
      name: `${getMonthName(m._id.m)} '${m._id.y % 100}`,
      requests: m.count,
      total,
      fill: '#10b981'  // Green color for tooltip dots
    }));
  }, [data]);

  const dailyData = useMemo(() => {
    if (!data?.dailyRequests) return [];
    const total = data.dailyRequests.reduce((sum, d) => sum + d.count, 0);
    const avg = total / data.dailyRequests.length;
    return data.dailyRequests.map(d => ({
      date: `${d._id.month}/${d._id.day}`,
      requests: d.count,
      total,
      avg: Math.round(avg),
      fill: '#3b82f6'  // Blue color for tooltip dots
    }));
  }, [data]);

  const topEquipmentData = useMemo(() => {
    if (!data?.topEquipment) return [];
    const total = data.topEquipment.reduce((sum, e) => sum + e.qty, 0);
    const colors = ['#0ea5e9', '#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    return data.topEquipment.slice(0, 8).map((e, index) => ({
      name: e.name.length > 20 ? e.name.substring(0, 20) + '...' : e.name,
      fullName: e.name,
      quantity: e.qty,
      total,
      category: e.category,
      fill: colors[index % colors.length]  // Unique color for each item
    }));
  }, [data]);

  const categoryData = useMemo(() => {
    if (!data?.equipmentCounts) return [];
    console.log('Equipment Counts from API:', data.equipmentCounts);
    const total = data.equipmentCounts.reduce((sum, c) => sum + c.count, 0);
    
    return data.equipmentCounts.map((c, i) => {
      // Use the 'available' field from API, which represents currently available items
      const available = c.available !== undefined ? c.available : c.count;
      console.log(`Category ${c._id}: count=${c.count}, available=${c.available}, calculated inUse=${c.count - available}`);
      const inUse = Math.max(0, c.count - available);
      const utilizationRate = c.count > 0 ? ((inUse / c.count) * 100).toFixed(0) : 0;
      
      // Find request count for this category
      const categoryRequest = (data.categoryRequests || []).find(cr => cr._id === c._id);
      const requestCount = categoryRequest?.count || 0;
      
      // Build insights with better context
      const insight = [];
      
      if (available === c.count) {
        insight.push(`All ${c.count} items available`);
      } else {
        insight.push(`${available}/${c.count} available now`);
      }
      
      if (inUse > 0) {
        insight.push(`${inUse} item${inUse !== 1 ? 's' : ''} in use (${utilizationRate}%)`);
      } else {
        insight.push('No items currently in use');
      }
      
      if (requestCount > 0) {
        insight.push(`${requestCount} total request${requestCount !== 1 ? 's' : ''}`);
      } else {
        insight.push('No requests yet');
      }
      
      const color = getCategoryColor(i);
      return {
        name: c._id || 'Uncategorized',
        value: c.count,
        fill: color,
        originalColor: color,
        totalValue: total,
        insight
      };
    });
  }, [data]);

  const categoryRequestsData = useMemo(() => {
    if (!data?.categoryRequests) return [];
    const total = data.categoryRequests.reduce((sum, c) => sum + c.count, 0);
    const allData = data.categoryRequests.map((c, index) => ({
      name: c._id || 'Uncategorized',
      requests: c.count,
      total,
      barColor: getCategoryColor(index),
      _allData: data.categoryRequests.map(item => ({ requests: item.count }))
    }));
    return allData;
  }, [data]);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <div>Loading analytics data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Analytics Dashboard</h1>
        <div className={styles.headerActions}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto-refresh (30s)
          </label>
          <a className={styles.apiDocsButton} href="http://localhost:5001/api/docs/" target="_blank" rel="noreferrer">
            API Docs
          </a>
          <button
            className={styles.refreshButton}
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshIcon className={refreshing ? styles.iconSpin : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {data && (
        <>
          <div className={styles.kpiGrid}>
            <KPICard
              title="Total Requests"
              value={data.kpis?.totalRequests || 0}
              color="primary"
              subtitle="All time requests"
              icon={KPIIcons.requests}
            />
            <KPICard
              title="Approval Rate"
              value={`${data.kpis?.approvalRate || 0}%`}
              color="success"
              subtitle="Success rate"
              icon={KPIIcons.checkCircle}
            />
            <KPICard
              title="Pending Requests"
              value={data.kpis?.pendingRequests || 0}
              color="warning"
              subtitle="Awaiting approval"
              icon={KPIIcons.clock}
            />
            <KPICard
              title="Overdue Items"
              value={data.kpis?.overdueRequests || 0}
              color="danger"
              subtitle="Past return date"
              icon={KPIIcons.alert}
            />
            <KPICard
              title="Utilization Rate"
              value={`${data.kpis?.utilizationRate || 0}%`}
              color="info"
              subtitle="Equipment in use"
              icon={KPIIcons.activity}
            />
            <KPICard
              title="Avg Approval Time"
              value={`${data.kpis?.avgApprovalTime || 0}h`}
              color="purple"
              subtitle="Average processing"
              icon={KPIIcons.timer}
            />
          </div>

          <div className={styles.chartsGrid}>
            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Request Activity (Last 30 Days)</h3>
                  <p className={styles.chartSubtitle}>Daily request volume trend</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyData} margin={{ left: 10, right: 20, top: 5, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Date', position: 'bottom', offset: 0, style: { fontSize: '11px', fill: '#374151' } }}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#374151' } }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                      animationDuration={200}
                      isAnimationActive={true}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRequests)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${styles.chartCard} ${styles.halfWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Monthly Requests</h3>
                  <p className={styles.chartSubtitle}>Last 12 months trend</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={monthlyData} margin={{ left: 15, right: 25, top: 20, bottom: 25 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                      </linearGradient>
                      <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      label={{ value: 'Month', position: 'insideBottom', offset: -8, style: { fontSize: '11px', fill: '#374151', fontWeight: '600' } }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#374151', fontWeight: '600' } }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                      animationDuration={200}
                      isAnimationActive={true}
                    />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stroke="none"
                      fill="url(#areaGradient)"
                      fillOpacity={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="url(#lineGradient)"
                      strokeWidth={3.5}
                      dot={{ 
                        fill: '#10b981', 
                        r: 5, 
                        strokeWidth: 2, 
                        stroke: '#fff',
                        filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.4))'
                      }}
                      activeDot={{ 
                        r: 7, 
                        fill: '#10b981',
                        stroke: '#fff',
                        strokeWidth: 3,
                        filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.6))'
                      }}
                      animationDuration={1200}
                      animationEasing="ease-out"
                      style={{
                        filter: 'drop-shadow(0 2px 6px rgba(16, 185, 129, 0.3))'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${styles.chartCard} ${styles.halfWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Requests by Status</h3>
                  <p className={styles.chartSubtitle}>Total request count per status</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                {statusData.length === 0 ? (
                  <div className={styles.noData}>No request data available</div>
                ) : (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <ResponsiveContainer width="45%" height={300}>
                    <PieChart>
                      <defs>
                        {statusData.map((entry, index) => (
                          <radialGradient key={`statusGradient-${index}`} id={`statusGradient-${index}`}>
                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                          </radialGradient>
                        ))}
                        <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={false}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#statusGradient-${index})`}
                            filter="url(#pieGlow)"
                            originalColor={entry.fill}
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<EnhancedPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, maxWidth: '320px' }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'auto 60px 70px',
                      gap: '1rem',
                      padding: '0.5rem 0',
                      marginBottom: '0.5rem',
                      borderBottom: '2px solid #e5e7eb',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span>Status</span>
                      <span style={{ textAlign: 'right' }}>Count</span>
                      <span style={{ textAlign: 'right' }}>Share</span>
                    </div>
                    {statusData.map((entry, index) => {
                      const percentage = entry.totalValue > 0 ? ((entry.value / entry.totalValue) * 100).toFixed(1) : 0;
                      return (
                        <div key={index} style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'auto 60px 70px',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '0.5rem 0',
                          borderBottom: index < statusData.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              backgroundColor: entry.fill,
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${entry.fill}`,
                              animation: 'pulse 2s ease-in-out infinite'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>{entry.name}</span>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{entry.value}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            </div>

            <div className={`${styles.chartCard} ${styles.halfWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Top Borrowed Equipment</h3>
                  <p className={styles.chartSubtitle}>Total quantity borrowed across all requests</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                {topEquipmentData.length === 0 ? (
                  <div className={styles.noData}>No equipment has been borrowed yet</div>
                ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <RBarChart 
                    data={topEquipmentData} 
                    layout="vertical" 
                    margin={{ left: 20, right: 30, top: 15, bottom: 30 }}
                    barSize={28}
                  >
                    <defs>
                      <linearGradient id="borrowedGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                        <stop offset="50%" stopColor="#0ea5e9" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                      </linearGradient>
                      <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      label={{ value: 'Quantity Borrowed', position: 'insideBottom', offset: -5, style: { fontSize: '11px', fill: '#374151', fontWeight: '600' } }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={150} 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px', fontWeight: '500' }}
                      tickLine={false}
                      axisLine={{ stroke: '#d1d5db' }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />} 
                      cursor={{ fill: 'rgba(14, 165, 233, 0.08)', radius: 6 }}
                      animationDuration={200}
                    />
                    <Bar 
                      dataKey="quantity" 
                      fill="url(#borrowedGradient)"
                      radius={[0, 12, 12, 0]}
                      animationDuration={1000}
                      animationBegin={0}
                      animationEasing="ease-out"
                      style={{
                        filter: 'drop-shadow(0 4px 6px rgba(14, 165, 233, 0.25))',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </RBarChart>
                </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={`${styles.chartCard} ${styles.halfWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Equipment by Category</h3>
                  <p className={styles.chartSubtitle}>Total equipment items in inventory</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                {categoryData.length === 0 ? (
                  <div className={styles.noData}>No equipment categories available</div>
                ) : (
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <ResponsiveContainer width="45%" height={300}>
                    <PieChart>
                      <defs>
                        {categoryData.map((entry, index) => (
                          <radialGradient key={`categoryGradient-${index}`} id={`categoryGradient-${index}`}>
                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                            <stop offset="100%" stopColor={entry.fill} stopOpacity={0.6} />
                          </radialGradient>
                        ))}
                        <filter id="pieGlow2" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                        label={false}
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#categoryGradient-${index})`}
                            filter="url(#pieGlow2)"
                            originalColor={entry.fill}
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.3))',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<EnhancedPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1, maxWidth: '320px' }}>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'auto 60px 70px',
                      gap: '1rem',
                      padding: '0.5rem 0',
                      marginBottom: '0.5rem',
                      borderBottom: '2px solid #e5e7eb',
                      fontWeight: '600',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <span>Category</span>
                      <span style={{ textAlign: 'right' }}>Items</span>
                      <span style={{ textAlign: 'right' }}>Share</span>
                    </div>
                    {categoryData.map((entry, index) => {
                      const percentage = entry.totalValue > 0 ? ((entry.value / entry.totalValue) * 100).toFixed(1) : 0;
                      return (
                        <div key={index} style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'auto 60px 70px',
                          gap: '1rem',
                          alignItems: 'center',
                          padding: '0.5rem 0',
                          borderBottom: index < categoryData.length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%', 
                              backgroundColor: entry.fill,
                              flexShrink: 0,
                              boxShadow: `0 0 8px ${entry.fill}`,
                              animation: 'pulse 2s ease-in-out infinite'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>{entry.name}</span>
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{entry.value}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>{percentage}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                )}
              </div>
            </div>

            <div className={`${styles.chartCard} ${styles.fullWidth}`}>
              <div className={styles.chartHeader}>
                <div>
                  <h3 className={styles.chartTitle}>Requests by Equipment Category</h3>
                  <p className={styles.chartSubtitle}>Number of requests per equipment category</p>
                </div>
              </div>
              <div className={styles.chartBody}>
                <ResponsiveContainer width="100%" height={380}>
                  <RBarChart 
                    data={categoryRequestsData} 
                    margin={{ left: 10, right: 20, top: 20, bottom: 30 }}
                    barSize={60}
                    barGap={8}
                  >
                    <defs>
                      {categoryRequestsData.map((entry, index) => {
                        const color = getCategoryColor(index);
                        return (
                          <linearGradient key={`gradient-${index}`} id={`bar3DGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="50%" stopColor={color} stopOpacity={0.85} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Category', position: 'bottom', offset: 0, style: { fontSize: '11px', fill: '#374151' } }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      stroke="#4b5563" 
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Requests', angle: -90, position: 'insideLeft', style: { fontSize: '11px', fill: '#374151' } }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      content={<EnhancedBarTooltip />} 
                      cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }}
                      animationDuration={200}
                      isAnimationActive={true}
                    />
                    <Bar 
                      dataKey="requests" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={800}
                      animationBegin={0}
                      animationEasing="ease-out"
                    >
                      {categoryRequestsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#bar3DGradient-${index})`}
                          style={{ 
                            filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                        />
                      ))}
                    </Bar>
                  </RBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getStatusColor(status) {
  const colors = {
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    returned: '#06b6d4',
    expired: '#6b7280'
  };
  return colors[status] || '#9ca3af';
}

function getStatusInsight(status, count) {
  const insights = {
    pending: count > 5 ? 'High volume - needs attention' : 'Awaiting admin approval',
    approved: 'Currently in circulation',
    rejected: 'Declined by administrator',
    returned: 'Successfully completed',
    expired: 'Past return date'
  };
  return insights[status] || 'Status information';
}

function getCategoryColor(index) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
  return colors[index % colors.length];
}

function getMonthName(month) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || '';
}

export default Analytics;
