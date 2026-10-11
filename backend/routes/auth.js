const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()
const jwtSecret = process.env.JWT_SECRET || 'local-development-secret-change-me'

function createToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' })
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    zipCode: user.zipCode || '',
    dietaryPreference: user.dietaryPreference || 'None',
    favoriteCuisine: user.favoriteCuisine || 'All',
    createdAt: user.createdAt,
  }
}

function requireAuth(request, response, next) {
  const authorization = request.headers.authorization
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null

  if (!token) {
    return response.status(401).json({ error: 'Authentication required.' })
  }

  try {
    request.userId = jwt.verify(token, jwtSecret).userId
    return next()
  } catch (error) {
    return response.status(401).json({ error: 'Invalid or expired token.' })
  }
}

router.post('/signup', async (request, response) => {
  try {
    const { name, email, password, phone, address } = request.body
    const normalizedEmail = email?.trim().toLowerCase()

    if (!name?.trim() || !normalizedEmail || !password) {
      return response.status(400).json({ error: 'Name, email, and password are required.' })
    }

    if (password.length < 8) {
      return response.status(400).json({ error: 'Password must be at least 8 characters.' })
    }

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return response.status(409).json({ error: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone?.trim() || '',
      address: address?.trim() || '',
    })

    return response.status(201).json({ token: createToken(user._id.toString()), user: publicUser(user) })
  } catch (error) {
    return response.status(500).json({ error: 'Unable to create account.' })
  }
})

router.post('/login', async (request, response) => {
  try {
    const { email, password } = request.body
    const normalizedEmail = email?.trim().toLowerCase()

    if (!normalizedEmail || !password) {
      return response.status(400).json({ error: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash')
    const passwordMatches = user && await bcrypt.compare(password, user.passwordHash)

    if (!passwordMatches) {
      return response.status(401).json({ error: 'Invalid email or password.' })
    }

    return response.json({ token: createToken(user._id.toString()), user: publicUser(user) })
  } catch (error) {
    return response.status(500).json({ error: 'Unable to log in.' })
  }
})

router.get('/me', requireAuth, async (request, response) => {
  const user = await User.findById(request.userId)

  if (!user) {
    return response.status(404).json({ error: 'User not found.' })
  }

  return response.json({ user: publicUser(user) })
})

router.put('/profile', requireAuth, async (request, response) => {
  try {
    const { name, phone, address, city, zipCode, dietaryPreference, favoriteCuisine } = request.body

    const updateFields = {}
    if (typeof name === 'string' && name.trim()) updateFields.name = name.trim()
    if (typeof phone === 'string') updateFields.phone = phone.trim()
    if (typeof address === 'string') updateFields.address = address.trim()
    if (typeof city === 'string') updateFields.city = city.trim()
    if (typeof zipCode === 'string') updateFields.zipCode = zipCode.trim()
    if (typeof dietaryPreference === 'string') updateFields.dietaryPreference = dietaryPreference
    if (typeof favoriteCuisine === 'string') updateFields.favoriteCuisine = favoriteCuisine.trim()

    const user = await User.findByIdAndUpdate(
      request.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    )

    if (!user) {
      return response.status(404).json({ error: 'User not found.' })
    }

    return response.json({ message: 'Profile updated successfully', user: publicUser(user) })
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Unable to update profile.' })
  }
})

module.exports = router
