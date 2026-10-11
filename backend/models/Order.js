const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: true },
  image: { type: String },
})

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    restaurant: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      image: { type: String },
      address: { type: String },
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    appliedCoupon: { type: String, default: '' },
    deliveryFee: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Preparing', 'On the way', 'Delivered', 'Cancelled'],
      default: 'Preparing',
    },
    estimatedDeliveryTime: {
      type: String,
      default: '25-35 mins',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Order', orderSchema)
