import { useEffect, useState } from 'react'
import {
  decrementProfileProperty,
  getCleverTapConfig,
  getRecentEvents,
  identifyUser,
  incrementProfileProperty,
  initCleverTap,
  isCleverTapOffline,
  setOfflineMode,
  setUserLocation,
  subscribeToCleverTapEvents,
  trackCharged,
  trackEvent,
  updateUserProfile,
} from '../../services/clevertap'

export function CleverTapInspector() {
  const [config] = useState(() => getCleverTapConfig())
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('events') // 'events' | 'simulator' | 'guide'
  const [events, setEvents] = useState(() => getRecentEvents())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isOffline, setIsOffline] = useState(() => isCleverTapOffline())

  useEffect(() => {
    initCleverTap()
    const unsubscribe = subscribeToCleverTapEvents((newEvent, allEvents) => {
      setEvents(allEvents)
    })
    return unsubscribe
  }, [])

  function handleToggleOffline() {
    const nextState = !isOffline
    setIsOffline(nextState)
    setOfflineMode(nextState)
  }

  function simulateLogin() {
    identifyUser({
      name: 'Jack Montana',
      email: 'jack.montana@example.com',
      id: 'USR_84920',
      phone: '+14155551234',
      customerType: 'Platinum',
      gender: 'M',
      dob: new Date('1994-05-15'), // Date of birth (Age is computed automatically)
      categoryResubscribe: { email: ['Newsletter', 'Exclusive Offers'] },
      categoryUnsubscribe: { email: ['Daily Digest'] },
    })
  }

  function simulateProfileUpdate() {
    updateUserProfile({
      'Customer Type': 'Gold VIP',
      'Preferred Cuisine': 'Italian & Japanese',
      'Dietary Preference': 'Vegetarian',
      'Last Interaction': new Date(),
    })
  }

  function simulateIncrementPoints() {
    incrementProfileProperty('Loyalty Points', 50)
  }

  function simulateDecrementCredits() {
    decrementProfileProperty('Account Credits', 10)
  }

  function simulateManualLocation(lat, lng, cityName) {
    setUserLocation(lat, lng)
  }

  function simulateAutoLocation() {
    setUserLocation()
  }

  function simulateProductView() {
    trackEvent('Product Viewed', {
      'Product Name': 'Casio Chronograph Watch',
      'Category': "Men's Accessories",
      'Price': 59.99,
      'Currency': 'USD',
      'In Stock': true,
    })
  }

  function simulateCharged() {
    trackCharged({
      totalAmount: 64.98,
      subtotal: 54.99,
      deliveryFee: 2.99,
      discountAmount: 10.0,
      couponCode: 'WELCOME50',
      restaurantName: 'Bella Vista Trattoria',
      restaurantId: 'rest-1',
      items: [
        { id: '101', name: 'Truffle Mushroom Pizza', price: 24.99, quantity: 1, category: 'Pizza' },
        { id: '102', name: 'Handcrafted Tiramisu', price: 9.99, quantity: 2, category: 'Dessert' },
      ],
    })
  }


  return (
    <>
      {/* Floating Trigger Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#ed6a45] to-[#f97316] px-4 py-2.5 text-xs font-bold text-white shadow-xl shadow-orange-500/25 transition-all hover:scale-105 hover:shadow-orange-500/40 active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
        </span>
        <span>CleverTap Debugger</span>
        <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-black">
          {events.length}
        </span>
      </button>

      {/* Main Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#202d26] px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed6a45] text-lg font-black text-white">
                  CT
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold tracking-tight">CleverTap Learning Hub</h2>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      v3.0 Web SDK
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Console Mode & Interactive Inspector
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* SDK Status Strip */}
            <div className="grid grid-cols-4 gap-2 border-b border-gray-100 bg-gray-50/80 px-6 py-3 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Dashboard ID</span>
                <span className="font-mono font-bold text-gray-900 mt-0.5 block truncate" title={config.accountId}>
                  {config.accountId}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Region</span>
                <span className="font-semibold text-gray-900 mt-0.5 flex items-center gap-1">
                  <span className="rounded bg-gray-200 px-1 py-0.2 text-[10px] font-bold uppercase">{config.region}</span>
                  <span className="text-[10px] text-gray-500">EU</span>
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Mode</span>
                <span className={`font-semibold flex items-center gap-1.5 mt-0.5 ${isOffline ? 'text-amber-700' : 'text-emerald-700'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isOffline ? 'Offline Queue' : 'Live Dashboard'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">SPA Mode</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-white px-6">
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
                  activeTab === 'events'
                    ? 'border-[#ed6a45] text-[#ed6a45]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Event Stream ({events.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
                  activeTab === 'simulator'
                    ? 'border-[#ed6a45] text-[#ed6a45]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                SDK Simulator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`border-b-2 py-3 px-3 text-xs font-bold transition-colors ${
                  activeTab === 'guide'
                    ? 'border-[#ed6a45] text-[#ed6a45]'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                Quick Reference
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TAB 1: Real-time Event Stream */}
              {activeTab === 'events' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Live events captured in this session. Open your browser DevTools Console (<kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">F12</kbd> or <kbd className="rounded bg-gray-100 px-1 py-0.5 text-[10px]">Cmd+Option+I</kbd>) to view formatted logs!
                    </p>
                  </div>

                  {events.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                      <p className="text-sm font-semibold text-gray-600">No events tracked yet</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Browse the app, add items to cart, or use the Simulator tab to trigger events.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {events.map((evt, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedEvent(selectedEvent === evt ? null : evt)}
                          className={`cursor-pointer rounded-xl border p-3 transition-all ${
                            selectedEvent === evt
                              ? 'border-[#ed6a45] bg-orange-50/40 shadow-xs'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  evt.type === 'ON_USER_LOGIN'
                                    ? 'bg-blue-100 text-blue-700'
                                    : evt.type === 'CHARGED_EVENT'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : evt.type === 'PROFILE_PUSH'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                                }`}
                              >
                                {evt.type === 'ON_USER_LOGIN'
                                  ? 'onUserLogin'
                                  : evt.type === 'CHARGED_EVENT'
                                  ? 'Charged'
                                  : evt.type === 'PROFILE_PUSH'
                                  ? 'profile.push'
                                  : 'event.push'}
                              </span>
                              <span className="text-xs font-bold text-gray-800">
                                {evt.name || evt.data?.Site?.Name || evt.type}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {evt.timestamp}
                            </span>
                          </div>

                          {/* Expanded JSON Inspector */}
                          {selectedEvent === evt && (
                            <div className="mt-3 rounded-lg bg-gray-900 p-3 font-mono text-[11px] text-gray-200">
                              <div className="mb-1 text-[10px] uppercase font-bold text-gray-400">
                                Payload dispatched to CleverTap:
                              </div>
                              <pre className="overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(evt.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SDK Simulator */}
              {activeTab === 'simulator' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Trigger CleverTap SDK APIs
                    </h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Click any button below to trigger the SDK call and see the formatted payload in the DevTools console:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* User Identity & Profile */}
                    <button
                      type="button"
                      onClick={simulateLogin}
                      className="flex flex-col items-start rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-left transition hover:bg-blue-100/60"
                    >
                      <span className="text-xs font-bold text-blue-900">👤 Identify User (with DOB & Categories)</span>
                      <span className="mt-1 text-[11px] text-blue-700 font-mono">clevertap.onUserLogin.push</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Enriches profile with Name, Email, DOB (Age computed automatically), and Category subscriptions.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={simulateProfileUpdate}
                      className="flex flex-col items-start rounded-xl border border-purple-200 bg-purple-50/50 p-4 text-left transition hover:bg-purple-100/60"
                    >
                      <span className="text-xs font-bold text-purple-900">📝 Update Profile Traits</span>
                      <span className="mt-1 text-[11px] text-purple-700 font-mono">clevertap.profile.push</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Appends custom traits like Customer Type, Preferred Cuisine, Dietary Preference.
                      </span>
                    </button>

                    {/* Numeric Increment / Decrement Operators */}
                    <button
                      type="button"
                      onClick={simulateIncrementPoints}
                      className="flex flex-col items-start rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-left transition hover:bg-emerald-100/60"
                    >
                      <span className="text-xs font-bold text-emerald-900">➕ Increment Property (+50)</span>
                      <span className="mt-1 text-[11px] text-emerald-700 font-mono">handleIncrementValue('Loyalty Points', 50)</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Increments numeric counter properties directly without reading existing balance.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={simulateDecrementCredits}
                      className="flex flex-col items-start rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-left transition hover:bg-rose-100/60"
                    >
                      <span className="text-xs font-bold text-rose-900">➖ Decrement Property (-10)</span>
                      <span className="mt-1 text-[11px] text-rose-700 font-mono">handleDecrementValue('Account Credits', 10)</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Decrements numeric counter properties (e.g. credits used).
                      </span>
                    </button>

                    {/* E-commerce Events */}
                    <button
                      type="button"
                      onClick={simulateProductView}
                      className="flex flex-col items-start rounded-xl border border-orange-200 bg-orange-50/50 p-4 text-left transition hover:bg-orange-100/60"
                    >
                      <span className="text-xs font-bold text-orange-900">⚡ Track Event (Product Viewed)</span>
                      <span className="mt-1 text-[11px] text-orange-700 font-mono">clevertap.event.push</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Tracks custom action with scalar key-value properties.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={simulateCharged}
                      className="flex flex-col items-start rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-left transition hover:bg-teal-100/60"
                    >
                      <span className="text-xs font-bold text-teal-900">💳 Charged (Purchase Event)</span>
                      <span className="mt-1 text-[11px] text-teal-700 font-mono">event.push('Charged', ...)</span>
                      <span className="mt-2 text-[10px] text-gray-500">
                        Special transaction event with item breakdown & revenue.
                      </span>
                    </button>
                  </div>

                  {/* Location Controls Section */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                    <div className="mb-3">
                      <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        📍 User Geolocation Enrichment (clevertap.getLocation)
                      </h4>
                      <p className="text-[11px] text-emerald-800/80 mt-0.5">
                        Sets the <code>$ct.location</code> profile property. Test browser auto-detection or manual coordinates:
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={simulateAutoLocation}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                      >
                        🌐 Auto-Detect via Browser
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateManualLocation(37.7749, -122.4194, 'San Francisco')}
                        className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
                      >
                        🌉 San Francisco
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateManualLocation(40.7128, -74.006, 'New York')}
                        className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
                      >
                        🗽 New York
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateManualLocation(19.076, 72.8777, 'Mumbai')}
                        className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
                      >
                        🇮🇳 Mumbai
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Offline Queue Mode</h4>
                        <p className="text-[11px] text-gray-500">
                          {isOffline
                            ? 'Events are queued locally without sending failing HTTP requests.'
                            : 'SDK will attempt real network requests to CleverTap servers.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleOffline}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          isOffline
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {isOffline ? 'Offline (Safe)' : 'Online (Network)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Guide & Best Practices */}
              {activeTab === 'guide' && (
                <div className="space-y-5 text-xs text-gray-600 leading-relaxed">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">CleverTap Web User Profiles Cheatsheet</h3>
                    <p className="mt-1 text-gray-500">
                      Essential rules & best practices for managing user profiles in CleverTap:
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-blue-600 font-mono font-bold">1.</span> onUserLogin vs profile.push
                      </h4>
                      <p className="mt-1.5 text-gray-600">
                        <strong>onUserLogin:</strong> Call this when a user logs in or signs up with a known <code>Identity</code>, <code>Email</code>, or <code>Phone</code>. It merges previous anonymous events with the user profile, or initializes a new profile if switching users.
                      </p>
                      <p className="mt-1 text-gray-600">
                        <strong>profile.push:</strong> Call this to update properties on the <em>current</em> profile without re-authenticating or switching users.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-indigo-600 font-mono font-bold">2.</span> DOB vs Age Rule
                      </h4>
                      <p className="mt-1.5 text-gray-600">
                        Always pass <code>DOB</code> as a JavaScript <code>Date</code> object. <strong>Do NOT pass Age directly!</strong> CleverTap automatically calculates and updates the user's Age from their Date of Birth.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-emerald-600 font-mono font-bold">3.</span> User Geolocation (getLocation)
                      </h4>
                      <p className="mt-1.5 text-gray-600">
                        Call <code>clevertap.getLocation(lat, lng)</code> to set exact coordinates, or <code>clevertap.getLocation()</code> to auto-detect location using the browser's HTML5 Geolocation API. Sets the <code>$ct.location</code> profile attribute.
                      </p>
                      <p className="mt-1 text-gray-500 italic">
                        Note: On Safari, geolocation permission is cached in localStorage under <code>WZRK_GEO</code>. Clear that key to prompt again.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-purple-600 font-mono font-bold">4.</span> Increment & Decrement Operators
                      </h4>
                      <p className="mt-1.5 text-gray-600">
                        Instead of reading and re-saving numeric totals, use:
                      </p>
                      <code className="mt-1 block rounded bg-gray-900 p-2 text-white font-mono text-[11px]">
                        clevertap.handleIncrementValue('Loyalty Points', 50)<br/>
                        clevertap.handleDecrementValue('Credits', 10)
                      </code>
                      <p className="mt-1 text-gray-600">
                        Supports Integer, Float, and Double values.
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                      <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="text-amber-600 font-mono font-bold">5.</span> Category-Level Subscriptions
                      </h4>
                      <p className="mt-1.5 text-gray-600">
                        Manage fine-grained email and push notification preferences:
                      </p>
                      <code className="mt-1 block rounded bg-gray-900 p-2 text-white font-mono text-[11px]">
                        "category-unsubscribe": &#123; "email": ["Promotions"] &#125;<br/>
                        "category-resubscribe": &#123; "email": ["Newsletter"] &#125;
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-right">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-300 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
