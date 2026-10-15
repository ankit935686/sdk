import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CartDrawer } from '../components/cart/CartDrawer'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { Toast } from '../components/ui/Toast'
import { foodCategories, restaurants } from '../data/foodData'
import { TOKEN_KEY } from '../hooks/AuthContext'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { api, withAuth } from '../lib/api'
import { trackPageView } from '../services/clevertap'


const DIETARY_OPTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-Free',
  'Halal',
  'Keto',
]

export function DashboardPage() {
  const { user, updateProfile, logout } = useAuth()
  const { notification, dismissNotification, addToCart, setIsCartOpen } = useCart()

  const [activeTab, setActiveTab] = useState('orders') // 'orders' | 'profile'
  const [orders, setOrders] = useState([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    dietaryPreference: 'None',
    favoriteCuisine: 'All',
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' })

  // Track Dashboard page view
  useEffect(() => {
    trackPageView('Dashboard')
  }, [])

  // Initialize form with current user profile
  useEffect(() => {

    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        dietaryPreference: user.dietaryPreference || 'None',
        favoriteCuisine: user.favoriteCuisine || 'All',
      })
    }
  }, [user])

  // Fetch real order history from MongoDB
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoadingOrders(false)
      return
    }

    api.get('/orders', withAuth(token))
      .then(({ data }) => {
        setOrders(data.orders || [])
      })
      .catch((err) => {
        console.error('Failed to fetch orders:', err)
      })
      .finally(() => {
        setIsLoadingOrders(false)
      })
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (saveStatus.message) setSaveStatus({ type: '', message: '' })
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    setIsSaving(true)
    setSaveStatus({ type: '', message: '' })

    try {
      await updateProfile(formData)
      setSaveStatus({
        type: 'success',
        message: 'Profile details saved successfully to your account and database!',
      })
      setTimeout(() => {
        setSaveStatus({ type: '', message: '' })
      }, 4000)
    } catch (err) {
      setSaveStatus({
        type: 'error',
        message: err.response?.data?.error || 'Unable to update profile. Please try again.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        dietaryPreference: user.dietaryPreference || 'None',
        favoriteCuisine: user.favoriteCuisine || 'All',
      })
      setSaveStatus({ type: '', message: '' })
    }
  }

  function handleReorder(order) {
    if (!order.items || order.items.length === 0) return
    const matchedRestaurant = restaurants.find((r) => r.id === order.restaurant.id) || {
      id: order.restaurant.id,
      name: order.restaurant.name,
      image: order.restaurant.image,
      address: order.restaurant.address,
    }

    order.items.forEach((item) => {
      addToCart(item, matchedRestaurant)
    })
    setIsCartOpen(true)
  }

  // Calculated Stats
  const totalOrdersCount = orders.length
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const totalSaved = orders.reduce((sum, o) => sum + (o.discountAmount || 0), 0)

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#202d26] flex flex-col justify-between">
      <div>
        <Navbar user={user} onLogout={logout} />

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-10">
          
          {/* User Welcome Hero Card */}
          <div className="rounded-3xl bg-linear-to-r from-[#202d26] to-[#31453b] p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-2xl font-black text-emerald-300 border border-emerald-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black">
                    {user?.name || 'Welcome!'}
                  </h1>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-[11px] font-black text-emerald-300 border border-emerald-500/30">
                    Active Account
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-300">
                  {user?.email} • {user?.phone || 'No phone added yet'}
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="self-start sm:self-center rounded-2xl bg-[#ed6a45] px-6 py-3.5 text-xs font-black text-white shadow-lg hover:bg-[#d85834] transition active:scale-95"
            >
              Order Food Now →
            </Link>
          </div>

          {/* Real-time Dashboard Stats Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs">
              <span className="text-2xl">🛍️</span>
              <p className="mt-2 text-2xl font-black text-gray-900">{totalOrdersCount}</p>
              <p className="text-xs font-semibold text-gray-500">Orders Placed in DB</p>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs">
              <span className="text-2xl">💳</span>
              <p className="mt-2 text-2xl font-black text-gray-900">${totalSpent.toFixed(2)}</p>
              <p className="text-xs font-semibold text-gray-500">Total Spent</p>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs">
              <span className="text-2xl">🏷️</span>
              <p className="mt-2 text-2xl font-black text-gray-900">${totalSaved.toFixed(2)}</p>
              <p className="text-xs font-semibold text-gray-500">Saved with Promos</p>
            </div>
            <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-2xs">
              <span className="text-2xl">🥗</span>
              <p className="mt-2 text-base font-black text-gray-900 truncate">
                {user?.dietaryPreference || 'None'}
              </p>
              <p className="text-xs font-semibold text-gray-500">Dietary Diet</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-10 flex gap-3 border-b border-gray-200/80 pb-3">
            <button
              onClick={() => setActiveTab('orders')}
              className={`rounded-2xl px-5 py-2.5 text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-[#202d26] text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>📦 Order History & Tracking</span>
              <span className="rounded-full bg-emerald-700 text-white px-2 py-0.5 text-[10px]">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`rounded-2xl px-5 py-2.5 text-xs font-black transition flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-[#202d26] text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>⚙️ Profile & Delivery Address</span>
            </button>
          </div>

          {/* TAB 1: ORDER HISTORY & TRACKING */}
          {activeTab === 'orders' && (
            <div className="mt-6 space-y-6">
              {isLoadingOrders ? (
                <div className="py-16 text-center">
                  <span className="text-4xl animate-spin block mb-3">⏳</span>
                  <p className="text-xs font-bold text-gray-500">Loading your orders from database...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-3xl bg-white p-12 text-center border border-gray-200/80 shadow-xs">
                  <span className="text-6xl block mb-4">🍽️</span>
                  <h3 className="text-xl font-black text-gray-900">No Orders Yet</h3>
                  <p className="mt-2 text-xs text-gray-500 max-w-sm mx-auto">
                    When you order food from any restaurant, your past orders, delivery tracking, and item receipts will show up right here in real time.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-block rounded-full bg-[#ed6a45] px-6 py-3 text-xs font-black text-white shadow hover:bg-[#d85834] transition"
                  >
                    Browse Handpicked Eateries →
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="rounded-3xl bg-white border border-gray-200/80 p-6 shadow-xs transition hover:shadow-md hover:border-gray-300"
                    >
                      {/* Order Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={order.restaurant?.image || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=150&q=80'}
                            alt={order.restaurant?.name}
                            className="h-12 w-12 rounded-2xl object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-gray-900">
                                {order.restaurant?.name}
                              </h3>
                              <span className="font-mono text-xs font-bold text-gray-400">
                                #{order.orderNumber}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            <span>{order.status || 'Preparing'}</span>
                          </span>
                          <button
                            onClick={() => handleReorder(order)}
                            className="rounded-xl border border-[#ed6a45] bg-white px-3.5 py-1.5 text-xs font-black text-[#ed6a45] hover:bg-[#ed6a45] hover:text-white transition"
                          >
                            Reorder
                          </button>
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="py-4 divide-y divide-gray-50">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`inline-block h-3 w-3 flex-shrink-0 rounded-xs border p-0.5 ${
                                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                              }`}>
                                <span className={`block h-full w-full rounded-full ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                }`} />
                              </span>
                              <span className="font-bold text-gray-800 truncate">{item.name}</span>
                              <span className="text-gray-400 font-semibold">x {item.quantity}</span>
                            </div>
                            <span className="font-bold text-gray-900">
                              ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Bill Summary */}
                      <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-gray-500">
                          <span>Delivery to: </span>
                          <span className="font-semibold text-gray-800">{order.deliveryAddress || 'Saved Address'}</span>
                          {order.appliedCoupon && (
                            <span className="ml-2 inline-block rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-800">
                              Promo: {order.appliedCoupon} (-${order.discountAmount?.toFixed(2)})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-gray-500">Total Paid:</span>
                          <span className="text-base font-black text-[#ed6a45]">
                            ${order.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE DETAILS FORM */}
          {activeTab === 'profile' && (
            <div className="mt-6 rounded-3xl bg-white p-6 sm:p-8 border border-gray-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Profile & Delivery Details
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Manage your personal details, default delivery address, and food preferences.
                  </p>
                </div>

                {user?.address && (
                  <span className="self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                    📍 Address on file
                  </span>
                )}
              </div>

              {/* Status Feedback Message */}
              {saveStatus.message && (
                <div
                  className={`mt-6 rounded-2xl p-4 text-xs font-bold flex items-center gap-2 ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <span>{saveStatus.type === 'success' ? '✓' : '⚠️'}</span>
                  <span>{saveStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-6">
                
                {/* Section 1: Basic Info */}
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-[#ed6a45] mb-3">
                    Personal Information
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Email Address (Account Identity)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ''}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Phone Number (For Delivery Updates)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Favorite Cuisine
                      </label>
                      <select
                        name="favoriteCuisine"
                        value={formData.favoriteCuisine}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="All">All Cuisines</option>
                        {foodCategories
                          .filter((c) => c.id !== 'all')
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Dietary Preferences */}
                <div className="pt-2">
                  <p className="text-xs font-black uppercase tracking-wider text-[#ed6a45] mb-3">
                    Dietary Preference
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((diet) => {
                      const isSelected = formData.dietaryPreference === diet
                      return (
                        <button
                          type="button"
                          key={diet}
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, dietaryPreference: diet }))
                          }
                          className={`rounded-2xl px-4 py-2 text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#202d26] text-white shadow-xs'
                              : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {diet === 'Vegetarian' && '🌱 '}
                          {diet === 'Vegan' && '🌿 '}
                          {diet === 'Gluten-Free' && '🌾 '}
                          {diet}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Section 3: Delivery Address */}
                <div className="pt-2">
                  <p className="text-xs font-black uppercase tracking-wider text-[#ed6a45] mb-3">
                    Primary Delivery Address
                  </p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Street Address & Apartment / Suite
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g. 742 Evergreen Terrace, Apt 3B"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. San Francisco"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Postal / ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="e.g. 94103"
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-2xl bg-[#ed6a45] px-7 py-3 text-xs font-black text-white shadow-lg shadow-orange-200 hover:bg-[#d85834] transition active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving to Database...' : 'Save Profile Changes'}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Favorite Spots */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">Recommended Restaurants For You</h2>
              <Link to="/" className="text-xs font-bold text-[#ed6a45] hover:underline">
                Explore all →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {restaurants.slice(0, 3).map((r) => (
                <Link
                  key={r.id}
                  to={`/restaurant/${r.id}`}
                  className="group rounded-2xl bg-white border border-gray-100 p-4 shadow-2xs hover:shadow-md transition flex items-center gap-3.5"
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-gray-900 group-hover:text-[#ed6a45] transition">
                      {r.name}
                    </h3>
                    <p className="truncate text-xs text-gray-500">{r.cuisine}</p>
                    <p className="mt-1 text-[11px] font-bold text-emerald-700">★ {r.rating}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <CartDrawer />
      <Toast message={notification} onDismiss={dismissNotification} />
      <Footer />
    </main>
  )
}
