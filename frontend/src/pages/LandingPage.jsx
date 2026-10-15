import { useEffect, useState } from 'react'
import { CartDrawer } from '../components/cart/CartDrawer'
import { CategoryFilter } from '../components/home/CategoryFilter'
import { HeroSection } from '../components/home/HeroSection'
import { OffersBanner } from '../components/home/OffersBanner'
import { RestaurantList } from '../components/home/RestaurantList'
import { Footer } from '../components/layout/Footer'
import { Navbar } from '../components/layout/Navbar'
import { Toast } from '../components/ui/Toast'
import { restaurants } from '../data/foodData'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { trackPageView } from '../services/clevertap'

export function LandingPage() {
  const { user, logout } = useAuth()
  const { notification, dismissNotification } = useCart()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    trackPageView('Landing Page', {
      'Featured Restaurants Count': restaurants.length,
    })
  }, [])


  function handleScrollToRestaurants() {
    const el = document.getElementById('restaurants-section')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#202d26]">
      {/* Navigation Bar */}
      <Navbar user={user} onLogout={logout} />

      {/* Hero Banner with Search */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExplore={handleScrollToRestaurants}
      />

      {/* Offers & Deals Banner */}
      <div id="offers">
        <OffersBanner />
      </div>

      {/* Categories Filter */}
      <div id="categories">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId)
            handleScrollToRestaurants()
          }}
        />
      </div>

      {/* Restaurant List Grid */}
      <RestaurantList
        restaurants={restaurants}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
      />

      {/* Cart Drawer & Notifications */}
      <CartDrawer />
      <Toast message={notification} onDismiss={dismissNotification} />

      {/* Footer */}
      <Footer />
    </main>
  )
}
