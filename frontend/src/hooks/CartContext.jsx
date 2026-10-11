import { createContext, useContext, useEffect, useState } from 'react'
import { offers } from '../data/foodData'

const CART_STORAGE_KEY = 'platera_cart_state'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : { restaurant: null, items: [] }
    } catch {
      return { restaurant: null, items: [] }
    }
  })

  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (e) {
      console.error('Failed to persist cart:', e)
    }
  }, [cart])

  function showToast(msg) {
    setNotification(msg)
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? '' : curr))
    }, 3500)
  }

  function addToCart(item, restaurant) {
    setCart((prev) => {
      // If switching restaurants, start fresh for that restaurant
      const isDifferentRestaurant = prev.restaurant && prev.restaurant.id !== restaurant.id
      const baseItems = isDifferentRestaurant ? [] : prev.items

      const existingIndex = baseItems.findIndex((i) => i.id === item.id)
      let newItems = []

      if (existingIndex > -1) {
        newItems = baseItems.map((cartItem, idx) =>
          idx === existingIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        newItems = [...baseItems, { ...item, quantity: 1 }]
      }

      if (isDifferentRestaurant) {
        showToast(`Cart reset to ${restaurant.name}`)
      } else {
        showToast(`Added ${item.name} to cart`)
      }

      return {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          image: restaurant.image,
          address: restaurant.address,
        },
        items: newItems,
      }
    })
  }

  function removeFromCart(itemId) {
    setCart((prev) => {
      const newItems = prev.items.filter((i) => i.id !== itemId)
      return {
        restaurant: newItems.length === 0 ? null : prev.restaurant,
        items: newItems,
      }
    })
  }

  function updateQuantity(itemId, newQty) {
    if (newQty <= 0) {
      removeFromCart(itemId)
      return
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, quantity: newQty } : i
      ),
    }))
  }

  function clearCart() {
    setCart({ restaurant: null, items: [] })
    setAppliedCoupon(null)
    showToast('Cart cleared')
  }

  function applyCoupon(code) {
    const foundOffer = offers.find(
      (o) => o.code.toUpperCase() === code.trim().toUpperCase()
    )

    if (!foundOffer) {
      showToast('Invalid promo coupon code.')
      return false
    }

    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    if (foundOffer.minOrder && subtotal < foundOffer.minOrder) {
      showToast(`Minimum order of $${foundOffer.minOrder} required for ${foundOffer.code}`)
      return false
    }

    setAppliedCoupon(foundOffer)
    showToast(`Coupon ${foundOffer.code} applied successfully! 🎉`)
    return true
  }

  function removeCoupon() {
    setAppliedCoupon(null)
    showToast('Coupon removed')
  }

  // Calculations
  const itemsCount = cart.items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = Number(cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2))

  let discountAmount = 0
  let isFreeDelivery = false

  if (appliedCoupon) {
    if (appliedCoupon.freeDelivery) {
      isFreeDelivery = true
    }
    if (appliedCoupon.discountPercent > 0) {
      const calculated = (subtotal * appliedCoupon.discountPercent) / 100
      discountAmount = appliedCoupon.maxDiscount
        ? Math.min(calculated, appliedCoupon.maxDiscount)
        : calculated
    }
  }

  const deliveryFee = itemsCount === 0 || isFreeDelivery || subtotal > 35 ? 0 : 2.99
  const taxAmount = itemsCount === 0 ? 0 : Number((subtotal * 0.085).toFixed(2))
  const totalAmount = Number(
    Math.max(0, subtotal - discountAmount + deliveryFee + taxAmount).toFixed(2)
  )

  const getItemQuantity = (itemId) => {
    const found = cart.items.find((i) => i.id === itemId)
    return found ? found.quantity : 0
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        itemsCount,
        subtotal,
        discountAmount: Number(discountAmount.toFixed(2)),
        deliveryFee,
        taxAmount,
        totalAmount,
        appliedCoupon,
        isCartOpen,
        notification,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
        dismissNotification: () => setNotification(''),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
