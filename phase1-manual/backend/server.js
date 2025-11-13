const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { startExpirationCronJob } = require('./services/requestExpirationService');
const { checkAndFixInventoryConsistency } = require('./middleware/inventoryConsistency');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Run initial inventory consistency check
    console.log('Running initial inventory consistency check...');
    const result = await checkAndFixInventoryConsistency();
    console.log(`✓ Checked ${result.checked} items, fixed ${result.fixed} inconsistencies`);
    
    // Start auto-expiration cron job after DB connection
    startExpirationCronJob();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/support', require('./routes/support'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    name: 'EquipShare API',
    version: '1.0.0',
    message: 'Smart Equipment Lending Platform'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
