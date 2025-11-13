const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    db: dbState === 1 ? 'connected' : dbState,
    timestamp: new Date().toISOString()
  });
});

router.get('/version', (req, res) => {
  res.json({ name: 'EquipShare API', version: '1.0.0' });
});

module.exports = router;