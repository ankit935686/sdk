import { Link } from 'react-router-dom'

export function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-gray-200"
    >
      {/* Image container */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/10" />

        {/* Offer Badge */}
        {restaurant.offerBadge && (
          <div className="absolute top-3 left-3 rounded-full bg-linear-to-r from-orange-600 to-amber-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md">
            🔥 {restaurant.offerBadge}
          </div>
        )}

        {/* Delivery Time Chip */}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white backdrop-blur-md flex items-center gap-1.5">
          <span>⏱️</span>
          <span>{restaurant.deliveryTime}</span>
          <span className="text-white/40">•</span>
          <span>{restaurant.distance}</span>
        </div>

        {/* Veg badge if only veg */}
        {restaurant.isVegOnly && (
          <div className="absolute top-3 right-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow">
            🌱 Pure Veg
          </div>
        )}
      </div>

      {/* Body content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-gray-900 group-hover:text-[#ed6a45] transition">
              {restaurant.name}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
              {restaurant.cuisine}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-800 border border-emerald-200/60">
            <span>★</span>
            <span>{restaurant.rating}</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
          {restaurant.tagline}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <span className="truncate">{restaurant.address}</span>
          <span className="font-bold text-gray-800 whitespace-nowrap">{restaurant.costForTwo}</span>
        </div>
      </div>
    </Link>
  )
}
