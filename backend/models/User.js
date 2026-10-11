const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    zipCode: {
      type: String,
      trim: true,
      default: '',
    },
    dietaryPreference: {
      type: String,
      enum: ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free', 'Halal', 'Keto'],
      default: 'None',
    },
    favoriteCuisine: {
      type: String,
      trim: true,
      default: 'All',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
