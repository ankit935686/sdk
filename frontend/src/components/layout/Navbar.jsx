import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'

export function Navbar({ user, onLogout }) {
  const { itemsCount, totalAmount, setIsCartOpen } = useCart()

  return (
    <header className="sticky top-0 z-30 bg-[#fbfaf7]/95 backdrop-blur-md border-b border-gray-200/70">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10 py-4">
        {/* Brand & Location */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#202d26]">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed6a45] text-lg font-black text-white shadow-xs">
              +
            </span>
            <span>platera</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 rounded-full bg-white border border-gray-200/80 px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs">
            <span className="text-[#ed6a45]">📍</span>
            <span className="font-bold text-gray-900">
              {user?.city ? `${user.city}${user?.zipCode ? ` (${user.zipCode})` : ''}` : 'San Francisco, CA'}
            </span>
            <span className="text-gray-400 text-[10px]">▼</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-gray-600">
          <Link to="/" className="hover:text-[#ed6a45] transition">Restaurants</Link>
          <a href="#offers" className="hover:text-[#ed6a45] transition">Offers</a>
          <a href="#categories" className="hover:text-[#ed6a45] transition">Cuisines</a>
        </div>

        {/* Right Actions: Cart & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white border border-gray-200/90 px-3.5 py-2 text-xs font-bold text-gray-800 shadow-2xs hover:border-gray-300 hover:bg-gray-50 transition active:scale-95"
          >
            <span className="text-base">🛒</span>
            <span className="hidden sm:inline">Cart</span>
            {itemsCount > 0 ? (
              <span className="grid h-5 min-w-5 px-1 place-items-center rounded-full bg-[#ed6a45] text-[11px] font-black text-white">
                {itemsCount}
              </span>
            ) : null}
            {itemsCount > 0 && (
              <span className="hidden sm:inline font-mono font-black text-[#ed6a45]">
                ${totalAmount.toFixed(2)}
              </span>
            )}
          </button>

          {/* User Auth state */}
          {user ? (
            <div className="group relative">
              <button className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-[#202d26] shadow-2xs hover:bg-gray-50 transition">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
              </button>
              
              <div className="invisible absolute right-0 top-11 z-50 w-56 rounded-2xl border border-gray-100 bg-white p-4 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <p className="text-xs font-black text-gray-900">{user.name}</p>
                <p className="mt-0.5 truncate text-[11px] text-gray-500">{user.email}</p>
                <div className="my-2 border-t border-gray-100" />
                <Link
                  to="/dashboard"
                  className="block rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-800 hover:bg-gray-100 transition"
                >
                  👤 My Profile & Settings
                </Link>
                <button
                  onClick={onLogout}
                  className="mt-2 w-full rounded-xl bg-rose-50 py-2 text-center text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-block px-3 py-2 text-xs font-bold text-gray-700 hover:text-gray-950 transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-[#202d26] px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-[#ed6a45] transition active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
