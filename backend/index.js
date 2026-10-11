const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })
const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/orders')

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

app.get('/api/health', (_request, response) => {
  response.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
    service: 'web-backend',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Add it to backend/.env.')
  }

  await mongoose.connect(process.env.MONGODB_URI)
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`)
  })
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Unable to start backend:', error.message)
    process.exit(1)
  })
}

module.exports = { app, startServer }
