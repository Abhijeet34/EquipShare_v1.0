const express = require('express');
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const { inventoryConsistencyMiddleware } = require('../middleware/inventoryConsistency');

const router = express.Router();

// Auto-check inventory consistency before serving equipment data
router.use(inventoryConsistencyMiddleware);

router
  .route('/')
  .get(getEquipment)
  .post(protect, authorize('admin', 'staff'), createEquipment);

router
  .route('/:id')
  .get(getEquipmentById)
  .put(protect, authorize('admin', 'staff'), updateEquipment)
  .delete(protect, authorize('admin'), deleteEquipment);

module.exports = router;
