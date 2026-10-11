export function HeroSection({ searchQuery, setSearchQuery, onExplore }) {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f2f7ef] to-[#fbfaf7] px-4 sm:px-6 lg:px-10 pt-10 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/80 px-3.5 py-1.5 text-xs font-black text-[#ed6a45] mb-4">
              <span>🔥</span>
              <span>Fastest Food Delivery in Town</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight text-gray-900">
              Craving great food? <br />
              <span className="text-[#ed6a45]">Delivered hot & fast.</span>
            </h1>

            <p className="mt-5 text-sm sm:text-base leading-relaxed text-gray-600 max-w-lg">
              Explore handpicked restaurants, artisan bakeries, and gourmet cloud kitchens with exclusive discounts and superfast delivery.
            </p>

            {/* Live Search Bar */}
            <div className="mt-8 flex max-w-lg items-center rounded-2xl bg-white p-2 shadow-xl shadow-gray-200/50 border border-gray-200/80">
              <span className="pl-3 text-lg text-gray-400">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 'pizza', 'sushi', 'burger', or restaurant..."
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-2 text-xs font-bold text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              ) : null}
              <button
                onClick={onExplore}
                className="rounded-xl bg-[#ed6a45] px-5 py-3 text-xs sm:text-sm font-black text-white shadow-md hover:bg-[#d85834] transition flex-shrink-0"
              >
                Find Food
              </button>
            </div>

            {/* Quick Feature Badges */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-bold text-gray-600">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                <span>No minimum order</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-100 text-amber-700">⚡</span>
                <span>Live order tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-[#ed6a45]">★</span>
                <span>4.9 / 5 customer rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Graphic */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-4/3 max-w-lg">
              <div className="absolute inset-0 rounded-[3rem] bg-linear-to-tr from-amber-200/40 via-emerald-100/50 to-orange-100/50 rotate-3 transform" />
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
                alt="Delicious Gourmet Dishes"
                className="relative h-full w-full rounded-[2.5rem] object-cover shadow-2xl"
              />

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-4 shadow-xl border border-gray-100 max-w-xs animate-pulse duration-1000">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🍕</span>
                  <div>
                    <p className="text-xs font-black text-gray-900">Wood-Fired Pizza</p>
                    <p className="text-[11px] font-semibold text-emerald-700">Delivered in 22 mins</p>
                  </div>
                </div>
              </div>

              {/* Floating discount badge */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-[#202d26] text-white p-3.5 shadow-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#ed6a45]">Promo code</p>
                <p className="font-mono text-sm font-black">WELCOME50</p>
                <p className="text-[10px] text-gray-300">50% off on your first order</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
