const express = require('express')
const jwt = require('jsonwebtoken')
const Order = require('../models/Order')

const router = express.Router()
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me'

function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) {
    return response.status(401).json({ error: 'Authentication required to manage orders.' })
  }

  try {
    request.userId = jwt.verify(token, jwtSecret).userId
    return next()
  } catch (error) {
    return response.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// Create new order
router.post('/', requireAuth, async (request, response) => {
  try {
    const {
      restaurant,
      items,
      subtotal,
      discountAmount = 0,
      appliedCoupon = '',
      deliveryFee = 0,
      taxAmount = 0,
      totalAmount,
      deliveryAddress = '',
    } = request.body

    if (!restaurant || !restaurant.name || !Array.isArray(items) || items.length === 0) {
      return response.status(400).json({ error: 'Order must contain a valid restaurant and items.' })
    }

    if (!totalAmount || totalAmount <= 0) {
      return response.status(400).json({ error: 'Total amount is invalid.' })
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`

    const order = await Order.create({
      userId: request.userId,
      orderNumber,
      restaurant,
      items,
      subtotal: Number(subtotal),
      discountAmount: Number(discountAmount),
      appliedCoupon,
      deliveryFee: Number(deliveryFee),
      taxAmount: Number(taxAmount),
      totalAmount: Number(totalAmount),
      deliveryAddress,
      status: 'Preparing',
      estimatedDeliveryTime: '25-35 mins',
    })

    return response.status(201).json({
      message: 'Order placed successfully',
      order,
    })
  } catch (error) {
    console.error('Failed to create order:', error)
    return response.status(500).json({ error: 'Unable to place order. Please try again.' })
  }
})

// Get all orders for the current user
router.get('/', requireAuth, async (request, response) => {
  try {
    const orders = await Order.find({ userId: request.userId })
      .sort({ createdAt: -1 })
      .lean()

    return response.json({ orders })
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return response.status(500).json({ error: 'Unable to fetch order history.' })
  }
})

// Get single order details
router.get('/:id', requireAuth, async (request, response) => {
  try {
    const order = await Order.findOne({
      _id: request.params.id,
      userId: request.userId,
    }).lean()

    if (!order) {
      return response.status(404).json({ error: 'Order not found.' })
    }

    return response.json({ order })
  } catch (error) {
    return response.status(500).json({ error: 'Unable to fetch order details.' })
  }
})

module.exports = router
