import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CartDrawer } from '../components/cart/CartDrawer'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { Toast } from '../components/ui/Toast'
import { getRestaurantById, offers } from '../data/foodData'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'

export function RestaurantPage() {
  const { id } = useParams()
  const { user, logout } = useAuth()
  const {
    addToCart,
    updateQuantity,
    getItemQuantity,
    itemsCount,
    totalAmount,
    setIsCartOpen,
    notification,
    dismissNotification,
    applyCoupon,
  } = useCart()

  const restaurant = getRestaurantById(id)

  const [activeCategory, setActiveCategory] = useState('All')
  const [vegOnly, setVegOnly] = useState(false)
  const [menuSearch, setMenuSearch] = useState('')

  if (!restaurant) {
    return (
      <main className="min-h-screen bg-[#fbfaf7] text-[#202d26] flex flex-col justify-between">
        <Navbar user={user} onLogout={logout} />
        <div className="py-24 text-center px-4">
          <span className="text-6xl mb-4 block">🔍</span>
          <h1 className="text-3xl font-black">Restaurant Not Found</h1>
          <p className="mt-2 text-sm text-gray-600">
            We couldn't locate the restaurant you're looking for.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-[#ed6a45] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#d85834] transition"
          >
            ← Back to Home
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return restaurant.menuItems.filter((item) => {
      // 1. Category filter
      if (activeCategory !== 'All' && item.category !== activeCategory) {
        return false
      }
      // 2. Veg only filter
      if (vegOnly && !item.isVeg) {
        return false
      }
      // 3. Search filter
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase().trim()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = item.description.toLowerCase().includes(q)
        return matchesName || matchesDesc
      }
      return true
    })
  }, [restaurant.menuItems, activeCategory, vegOnly, menuSearch])

  // Group filtered items by category for structured layout
  const groupedCategories = useMemo(() => {
    if (activeCategory !== 'All') {
      return { [activeCategory]: filteredMenuItems }
    }
    const groups = {}
    restaurant.menuCategories.forEach((cat) => {
      const items = filteredMenuItems.filter((i) => i.category === cat)
      if (items.length > 0) {
        groups[cat] = items
      }
    })
    return groups
  }, [filteredMenuItems, activeCategory, restaurant.menuCategories])

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#202d26] pb-24">
      <Navbar user={user} onLogout={logout} />

      {/* Breadcrumbs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link to="/" className="hover:text-gray-900 transition">Home</Link>
          <span>/</span>
          <Link to="/" className="hover:text-gray-900 transition">Restaurants</Link>
          <span>/</span>
          <span className="text-gray-900">{restaurant.name}</span>
        </nav>
      </div>

      {/* Restaurant Header Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-4 pb-8">
        <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200/80 shadow-sm">
          
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-gray-100">
            <img
              src={restaurant.bannerImage || restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Delivery time pill overlay */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white">
              <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                <span>⏱️</span> {restaurant.deliveryTime}
              </span>
              <span className="rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                <span>📍</span> {restaurant.distance}
              </span>
            </div>
          </div>

          {/* Restaurant Details Info Card */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    {restaurant.name}
                  </h1>
                  {restaurant.isVegOnly && (
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800">
                      🌱 Pure Veg
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-[#ed6a45]">
                  {restaurant.cuisine}
                </p>
                <p className="mt-2 text-xs text-gray-500 max-w-xl leading-relaxed">
                  {restaurant.tagline} • <span className="text-gray-700">{restaurant.address}</span>
                </p>
              </div>

              {/* Rating Card Box */}
              <div className="flex items-center gap-4 self-start rounded-2xl bg-gray-50 border border-gray-200/80 p-3 sm:p-4">
                <div className="flex items-center gap-1 text-emerald-700 font-black text-lg">
                  <span>★</span>
                  <span>{restaurant.rating}</span>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-left text-xs">
                  <p className="font-bold text-gray-800">{restaurant.reviewCount}</p>
                  <p className="text-[11px] text-gray-500">Reviews</p>
                </div>
                <div className="h-8 w-px bg-gray-200" />
                <div className="text-left text-xs">
                  <p className="font-bold text-gray-800">{restaurant.costForTwo}</p>
                  <p className="text-[11px] text-gray-500">Avg. Price</p>
                </div>
              </div>
            </div>

            {/* Restaurant Deals Ribbon */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2">
                Available Deals at this restaurant
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                {offers.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex-shrink-0 flex items-center gap-3 rounded-2xl bg-orange-50/70 border border-orange-200/60 p-3 text-xs"
                  >
                    <span className="text-lg">🏷️</span>
                    <div>
                      <p className="font-black text-gray-900">{deal.title}</p>
                      <p className="text-[11px] text-gray-600">Use code: <strong className="font-mono text-[#ed6a45]">{deal.code}</strong></p>
                    </div>
                    <button
                      onClick={() => applyCoupon(deal.code)}
                      className="ml-2 rounded-xl bg-white border border-orange-200 px-3 py-1 text-[11px] font-bold text-orange-900 hover:bg-orange-100 transition"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6">
        
        {/* Menu Navigation & Filters Bar */}
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-4 bg-[#fbfaf7]/95 backdrop-blur-md border-b border-gray-200/80 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveCategory('All')}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                activeCategory === 'All'
                  ? 'bg-[#202d26] text-white shadow'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Full Menu ({restaurant.menuItems.length})
            </button>
            {restaurant.menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#202d26] text-white shadow'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search in Menu & Pure Veg toggle */}
          <div className="flex items-center gap-3">
            {/* Veg toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 select-none">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="h-4 w-4 rounded-md accent-emerald-600 cursor-pointer"
              />
              <span>Veg Only</span>
            </label>

            {/* Menu Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search food items..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-48 sm:w-60 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {menuSearch && (
                <button
                  onClick={() => setMenuSearch('')}
                  className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items Rendered */}
        {Object.keys(groupedCategories).length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-5xl mb-3 block">🥗</span>
            <h3 className="text-xl font-bold text-gray-800">No dishes match your filters</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try clearing your search query or unchecking "Veg Only".
            </p>
            <button
              onClick={() => {
                setActiveCategory('All')
                setVegOnly(false)
                setMenuSearch('')
              }}
              className="mt-4 rounded-full bg-[#ed6a45] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#d85834]"
            >
              Reset Menu Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedCategories).map(([categoryTitle, items]) => (
              <div key={categoryTitle}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {categoryTitle}
                  </h2>
                  <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-700">
                    {items.length}
                  </span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {items.map((item) => {
                    const quantity = getItemQuantity(item.id)
                    return (
                      <div
                        key={item.id}
                        className="group relative flex flex-col sm:flex-row justify-between gap-4 rounded-3xl bg-white border border-gray-100 p-5 shadow-xs transition hover:shadow-md hover:border-gray-200"
                      >
                        {/* Info details */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Veg / Non-veg indicator square */}
                            <span className={`inline-block h-3.5 w-3.5 flex-shrink-0 rounded-xs border p-0.5 ${
                              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                            }`}>
                              <span className={`block h-full w-full rounded-full ${
                                item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                              }`} />
                            </span>
                            {item.bestseller && (
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-900">
                                ★ Bestseller
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-bold text-gray-900">
                            {item.name}
                          </h3>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-emerald-700 font-bold">
                              ★ {item.rating} <span className="text-gray-400 font-normal">({item.reviewsCount})</span>
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-gray-500 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Image + Add button control */}
                        <div className="relative sm:w-36 flex-shrink-0 flex sm:flex-col items-center justify-between sm:justify-end">
                          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                          </div>

                          {/* Action Counter / Add Button */}
                          <div className="mt-2 sm:-mt-4 relative z-10">
                            {quantity === 0 ? (
                              <button
                                onClick={() => addToCart(item, restaurant)}
                                className="rounded-xl bg-white border border-[#ed6a45] px-6 py-2 text-xs font-black uppercase tracking-wider text-[#ed6a45] shadow-md hover:bg-[#ed6a45] hover:text-white transition active:scale-95"
                              >
                                + ADD
                              </button>
                            ) : (
                              <div className="flex items-center rounded-xl border border-[#ed6a45] bg-[#ed6a45] text-white px-2 py-1 shadow-md">
                                <button
                                  onClick={() => updateQuantity(item.id, quantity - 1)}
                                  className="h-6 w-6 text-sm font-black hover:opacity-80"
                                >
                                  -
                                </button>
                                <span className="w-6 text-center text-xs font-black">
                                  {quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, quantity + 1)}
                                  className="h-6 w-6 text-sm font-black hover:opacity-80"
                                >
                                  +
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Sticky Bottom Cart Bar (if items in cart) */}
      {itemsCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between rounded-2xl bg-[#202d26] px-6 py-4 font-bold text-white shadow-2xl hover:bg-black transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ed6a45] text-xs font-black">
                {itemsCount}
              </span>
              <div className="text-left">
                <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">Total Amount</p>
                <p className="text-base font-black">${totalAmount.toFixed(2)}</p>
              </div>
            </div>
            <span className="flex items-center gap-2 text-sm font-black text-white">
              View Cart 🛒 →
            </span>
          </button>
        </div>
      )}

      <CartDrawer />
      <Toast message={notification} onDismiss={dismissNotification} />
      <Footer />
    </main>
  )
}
