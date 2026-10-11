import { useMemo, useState } from 'react'
import { RestaurantCard } from './RestaurantCard'

export function RestaurantList({
  restaurants,
  selectedCategory,
  searchQuery,
}) {
  const [filterType, setFilterType] = useState('all') // 'all', 'rating', 'fast', 'veg', 'offers'
  const [sortBy, setSortBy] = useState('popular') // 'popular', 'rating', 'delivery'

  const filteredRestaurants = useMemo(() => {
    let list = [...restaurants]

    // 1. Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      list = list.filter((r) => r.category === selectedCategory)
    }

    // 2. Filter by search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.menuItems.some((item) => item.name.toLowerCase().includes(q))
      )
    }

    // 3. Filter chips
    if (filterType === 'rating') {
      list = list.filter((r) => r.rating >= 4.8)
    } else if (filterType === 'fast') {
      list = list.filter((r) => {
        const min = parseInt(r.deliveryTime)
        return min <= 25
      })
    } else if (filterType === 'veg') {
      list = list.filter((r) => r.isVegOnly)
    } else if (filterType === 'offers') {
      list = list.filter((r) => Boolean(r.offerBadge))
    }

    // 4. Sort
    if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'delivery') {
      list.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime))
    }

    return list
  }, [restaurants, selectedCategory, searchQuery, filterType, sortBy])

  return (
    <section id="restaurants-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8">
      {/* Title & Filter bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200/70 pb-5">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#ed6a45]">
            Handpicked Eateries
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Top Restaurants Near You
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Showing {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'place' : 'places'} ready to deliver
          </p>
        </div>

        {/* Filters and Sorting controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Filters */}
          <button
            onClick={() => setFilterType((curr) => (curr === 'rating' ? 'all' : 'rating'))}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'rating'
                ? 'bg-[#ed6a45] text-white shadow'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ★ Rating 4.8+
          </button>
          
          <button
            onClick={() => setFilterType((curr) => (curr === 'fast' ? 'all' : 'fast'))}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'fast'
                ? 'bg-[#ed6a45] text-white shadow'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚡ Fast Delivery (&lt;25m)
          </button>

          <button
            onClick={() => setFilterType((curr) => (curr === 'veg' ? 'all' : 'veg'))}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === 'veg'
                ? 'bg-[#ed6a45] text-white shadow'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            🌱 Pure Veg
          </button>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="popular">Sort: Popular</option>
            <option value="rating">Sort: High Rating</option>
            <option value="delivery">Sort: Delivery Time</option>
          </select>
        </div>
      </div>

      {/* Grid of restaurants */}
      {filteredRestaurants.length === 0 ? (
        <div className="py-16 text-center">
          <span className="text-5xl mb-3 block">🍽️</span>
          <h3 className="text-xl font-bold text-gray-800">No restaurants found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            Try resetting your filters or searching for something else like "pizza", "burger", or "bowl".
          </p>
          <button
            onClick={() => {
              setFilterType('all')
            }}
            className="mt-4 rounded-full bg-[#ed6a45] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#d85834]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </section>
  )
}
