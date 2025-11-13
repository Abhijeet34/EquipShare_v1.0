const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

async function getSummary(req, res) {
  try {
    // Current time for calculations
    const now = new Date();
    
    // Total requests count
    const totalRequests = await Request.countDocuments();

    // Requests by status with additional insights
    const statusAgg = await Request.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Status insights - oldest pending request
    const oldestPending = await Request.findOne({ status: 'pending' }).sort({ createdAt: 1 });
    const oldestPendingDays = oldestPending ? Math.floor((now - oldestPending.createdAt) / (1000 * 60 * 60 * 24)) : 0;

    // Calculate approval rate
    const statusMap = statusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    const approved = statusMap.approved || 0;
    const rejected = statusMap.rejected || 0;
    const approvalRate = (approved + rejected) > 0 ? ((approved / (approved + rejected)) * 100).toFixed(1) : 0;

    // Top equipment by total requested quantity
    const topEquipment = await Request.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.equipment', qty: { $sum: '$items.quantity' } } },
      { $sort: { qty: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'equipment', localField: '_id', foreignField: '_id', as: 'equipment' } },
      { $unwind: '$equipment' },
      { $project: { _id: 0, equipmentId: '$equipment._id', name: '$equipment.name', category: '$equipment.category', qty: 1 } }
    ]);

    // Requests per month (last 12 months for better trend analysis)
    const since = new Date();
    since.setMonth(since.getMonth() - 11);
    since.setDate(1);
    since.setHours(0,0,0,0);

    const monthly = await Request.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } }
    ]);

    // Equipment by category with availability info
    const equipmentCounts = await Equipment.aggregate([
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: '$quantity' },  // Sum total quantities across all equipment
          available: { $sum: '$available' }  // Sum available quantities
        } 
      },
      { $sort: { count: -1 } }
    ]);

    // Total equipment count
    const totalEquipment = await Equipment.countDocuments();
    
    // Available equipment count
    const availableEquipment = await Equipment.countDocuments({ available: true });

    // Equipment utilization rate
    const utilizationRate = totalEquipment > 0 ? (((totalEquipment - availableEquipment) / totalEquipment) * 100).toFixed(1) : 0;

    // Average approval time (using statusHistory for accurate timing)
    const approvalTimeAgg = await Request.aggregate([
      { $match: { status: { $in: ['approved', 'returned'] } } },
      { $unwind: '$statusHistory' },
      { $match: { 'statusHistory.status': 'approved' } },
      { 
        $project: { 
          approvalTime: { 
            $subtract: ['$statusHistory.changedAt', '$createdAt'] 
          } 
        } 
      },
      { $group: { _id: null, avgTime: { $avg: '$approvalTime' } } }
    ]);
    const avgApprovalTime = approvalTimeAgg.length > 0 ? Math.max(1, Math.round(approvalTimeAgg[0].avgTime / (1000 * 60 * 60))) : 0; // in hours, minimum 1h

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRequests = await Request.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Daily requests for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyRequests = await Request.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Requests by category (via equipment)
    const categoryRequests = await Request.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'equipment', localField: 'items.equipment', foreignField: '_id', as: 'equipment' } },
      { $unwind: '$equipment' },
      { $group: { _id: '$equipment.category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Pending requests count
    const pendingRequests = statusMap.pending || 0;

    // Overdue requests count (matching Overdues tab logic)
    const overdueRequests = await Request.countDocuments({
      status: { $in: ['approved', 'overdue'] },
      'items.status': { $in: ['approved', 'overdue'] },
      'items.returnDate': { $lt: now }
    });

    res.json({
      success: true,
      data: {
        kpis: {
          totalRequests,
          approvalRate: parseFloat(approvalRate),
          utilizationRate: parseFloat(utilizationRate),
          avgApprovalTime,
          recentRequests,
          pendingRequests,
          overdueRequests,
          totalEquipment,
          availableEquipment
        },
        status: statusAgg,
        topEquipment,
        monthly,
        dailyRequests,
        equipmentCounts,
        categoryRequests,
        insights: {
          oldestPendingDays
        }
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = { getSummary };