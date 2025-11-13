const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { startExpirationCronJob } = require('./services/requestExpirationService');
const { startOverdueMonitor } = require('./services/overdueService');
const { startReminderService } = require('./services/overdueReminderService');
const { checkAndFixInventoryConsistency } = require('./middleware/inventoryConsistency');

dotenv.config();

const app = express();

// Security & logging
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS with whitelist
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    // Run initial inventory consistency check
    console.log('Running initial inventory consistency check...');
    const result = await checkAndFixInventoryConsistency();
    console.log(`✓ Checked ${result.checked} items, fixed ${result.fixed} inconsistencies`);
    
    // Start cron jobs after DB connection
    startExpirationCronJob();
    startOverdueMonitor();
    startReminderService();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/support', require('./routes/support'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api', require('./routes/health'));

// Swagger UI (serves static OpenAPI spec)
try {
  const swaggerUi = require('swagger-ui-express');
  const openapiPath = path.join(__dirname, 'openapi.json');
  if (fs.existsSync(openapiPath)) {
    const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf-8'));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
    console.log('Swagger docs available at /api/docs');
  }
} catch (e) {
  console.warn('Swagger UI not initialized:', e.message);
}

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
