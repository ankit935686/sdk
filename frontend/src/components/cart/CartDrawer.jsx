import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { offers } from '../../data/foodData'
import { TOKEN_KEY } from '../../hooks/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { api, withAuth } from '../../lib/api'

export function CartDrawer() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    cart,
    itemsCount,
    subtotal,
    discountAmount,
    deliveryFee,
    taxAmount,
    totalAmount,
    appliedCoupon,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  if (!isCartOpen) return null

  function handleApplyCoupon(codeToApply) {
    const code = codeToApply || couponInput
    if (applyCoupon(code)) {
      setCouponInput('')
    }
  }

  async function handleCheckout() {
    setOrderError('')

    if (!user) {
      setIsCartOpen(false)
      navigate('/login')
      return
    }

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsCartOpen(false)
      navigate('/login')
      return
    }

    setIsPlacingOrder(true)
    try {
      const payload = {
        restaurant: cart.restaurant,
        items: cart.items,
        subtotal,
        discountAmount,
        appliedCoupon: appliedCoupon?.code || '',
        deliveryFee,
        taxAmount,
        totalAmount,
        deliveryAddress: user.address
          ? `${user.address}${user.city ? `, ${user.city}` : ''}${user.zipCode ? ` ${user.zipCode}` : ''}`
          : 'Default Delivery Address',
      }

      const { data } = await api.post('/orders', payload, withAuth(token))
      setConfirmedOrder(data.order)
      clearCart()
    } catch (err) {
      console.error('Checkout error:', err)
      setOrderError(err.response?.data?.error || 'Unable to place order. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  function handleCloseModal() {
    setConfirmedOrder(null)
    setOrderError('')
    setIsCartOpen(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={handleCloseModal}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside aria-label="Shopping Cart" className="w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-black text-gray-900">Your Cart</h2>
              {cart.restaurant && !confirmedOrder && (
                <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                  from {cart.restaurant.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {itemsCount > 0 && !confirmedOrder && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Success screen on checkout */}
          {confirmedOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-4 animate-bounce">
                ✓
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                Order Confirmed
              </span>
              <h3 className="mt-2 text-2xl font-black text-gray-900">
                {confirmedOrder.orderNumber}
              </h3>
              <p className="mt-2 text-xs text-gray-600 max-w-xs">
                Your order from <strong>{confirmedOrder.restaurant?.name}</strong> has been saved to your account and sent to the kitchen!
              </p>
              
              <div className="mt-4 rounded-2xl bg-orange-50/80 border border-orange-200 p-4 text-left w-full space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-gray-900">⏱️ {confirmedOrder.estimatedDeliveryTime}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Total Paid:</span>
                  <span className="font-black text-[#ed6a45]">${confirmedOrder.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Deliver to:</span>
                  <span className="truncate max-w-[180px] font-medium text-gray-800">{confirmedOrder.deliveryAddress}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 w-full">
                <Link
                  to="/dashboard"
                  onClick={handleCloseModal}
                  className="rounded-2xl bg-[#202d26] py-3.5 text-xs font-black text-white shadow hover:bg-black transition text-center"
                >
                  View Order History →
                </Link>
                <button
                  onClick={handleCloseModal}
                  className="rounded-2xl border border-gray-200 bg-white py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          ) : itemsCount === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <span className="text-6xl mb-4">🛍️</span>
              <h3 className="text-xl font-bold text-gray-900">Your cart is empty</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs">
                Looks like you haven't added any delicious food items to your order yet.
              </p>
              <button
                onClick={handleCloseModal}
                className="mt-6 rounded-full bg-[#ed6a45] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#d85834] transition"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            /* Cart Items & Summary */
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              
              {/* Item List */}
              <div className="divide-y divide-gray-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`inline-block h-3.5 w-3.5 flex-shrink-0 rounded-xs border p-0.5 ${
                        item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        <span className={`block h-full w-full rounded-full ${
                          item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                        }`} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-6 w-6 text-base font-bold text-gray-600 hover:text-orange-600"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-6 w-6 text-base font-bold text-gray-600 hover:text-orange-600"
                        >
                          +
                        </button>
                      </div>
                      <span className="w-16 text-right text-sm font-black text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon / Promo Section */}
              <div className="rounded-2xl bg-orange-50/70 p-4 border border-orange-100">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-900 mb-2">
                  Apply Promo Code
                </p>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600 text-lg">🎉</span>
                      <div>
                        <p className="text-xs font-extrabold text-emerald-800">{appliedCoupon.code}</p>
                        <p className="text-[11px] text-emerald-600">{appliedCoupon.title}</p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. WELCOME50"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-700 transition"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick apply suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {offers.slice(0, 2).map((off) => (
                        <button
                          key={off.id}
                          onClick={() => handleApplyCoupon(off.code)}
                          className="rounded-lg bg-white border border-orange-200 px-2 py-1 text-[10px] font-bold text-orange-800 hover:bg-orange-100 transition"
                        >
                          Use {off.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100 space-y-2.5 text-xs text-gray-600">
                <p className="font-extrabold text-gray-900 text-sm mb-2">Bill Summary</p>
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-600">FREE</span>
                    ) : (
                      `$${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Restaurant Charges (8.5%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5 flex justify-between text-sm font-black text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-base text-[#ed6a45]">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Error banner if checkout failed */}
              {orderError && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-700">
                  ⚠️ {orderError}
                </div>
              )}

              {/* Authentication warning */}
              {!user && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                  💡 You are currently browsing as a guest. You will be redirected to log in or create an account to finalize your order.
                </div>
              )}

            </div>
          )}

          {/* Footer Checkout Action */}
          {itemsCount > 0 && !confirmedOrder && (
            <div className="border-t border-gray-100 p-6 bg-white shadow-lg space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder}
                className="w-full flex items-center justify-between rounded-2xl bg-[#ed6a45] px-6 py-4 font-bold text-white shadow-lg shadow-orange-200 hover:bg-[#d85834] transition active:scale-[0.99] disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-orange-100">
                    {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                  </p>
                  <p className="text-base font-black">${totalAmount.toFixed(2)}</p>
                </div>
                <span className="flex items-center gap-2 text-sm font-bold">
                  {isPlacingOrder
                    ? 'Saving Order...'
                    : user
                    ? 'Place Order in DB →'
                    : 'Log in to Checkout →'}
                </span>
              </button>
            </div>
          )}

        </aside>
      </div>
    </div>
  )
}
