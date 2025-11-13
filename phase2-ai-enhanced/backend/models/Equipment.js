const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide equipment name'],
    trim: true,
    minlength: [2, 'Equipment name must be at least 2 characters'],
    maxlength: [100, 'Equipment name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Sports', 'Lab', 'Electronics', 'Musical', 'Other']
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: 0
  },
  available: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
