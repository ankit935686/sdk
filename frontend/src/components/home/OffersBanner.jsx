import { offers } from '../../data/foodData'
import { useCart } from '../../hooks/useCart'

export function OffersBanner() {
  const { applyCoupon, setIsCartOpen } = useCart()

  function handleClaim(code) {
    applyCoupon(code)
    setIsCartOpen(true)
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#ed6a45]">
            Exclusive Deals
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Top Offers & Promos
          </h2>
        </div>
      </div>

      {/* Horizontal scrolling offer cards */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`min-w-[280px] sm:min-w-[340px] snap-start rounded-3xl bg-linear-to-r ${offer.bgColor} p-5 text-white shadow-md shadow-orange-950/10 flex flex-col justify-between relative overflow-hidden transition hover:-translate-y-1`}
          >
            {/* Background pattern */}
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-md pointer-events-none" />
            
            <div>
              <span className="inline-block rounded-full bg-black/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                {offer.badge}
              </span>
              <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight">
                {offer.title}
              </h3>
              <p className="mt-1 text-xs text-white/80 line-clamp-2">
                {offer.description}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                <span>🏷️</span>
                <span>{offer.code}</span>
              </div>
              <button
                onClick={() => handleClaim(offer.code)}
                className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-black text-gray-900 shadow-sm transition hover:bg-white/90 active:scale-95"
              >
                Apply Offer
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
