import clevertap from 'clevertap-web-sdk'

/**
 * CleverTap Configuration & Initialization Service
 * -------------------------------------------------
 * This service manages:
 * 1. Safe initialization of the CleverTap Web SDK in React / Vite SPAs.
 * 2. Learning / Offline Console Mode: When you don't have dashboard credentials,
 *    events are queued locally via `clevertap.setOffline(true)` and printed to the
 *    browser console with educational notes and payload inspections.
 * 3. User Identification (`onUserLogin`) vs Profile Enrichment (`profile.push`).
 * 4. Standardized Event Tracking (`event.push`, e-commerce `Charged` event).
 */

// Configuration loaded from Vite environment variables or defaults
const CLEVERTAP_ACCOUNT_ID = import.meta.env.VITE_CLEVERTAP_ACCOUNT_ID || '487-878-Z97Z'
const CLEVERTAP_REGION = import.meta.env.VITE_CLEVERTAP_REGION || 'eu1'

// Determine if we are running without real production credentials
const hasRealCredentials = Boolean(
  CLEVERTAP_ACCOUNT_ID &&
  !CLEVERTAP_ACCOUNT_ID.includes('DEMO') &&
  !CLEVERTAP_ACCOUNT_ID.includes('CLEVERTAP_ACCOUNT_ID')
)

// In development or when credentials aren't set, default to offline mode to prevent network errors
const isOfflineByDefault = !hasRealCredentials || import.meta.env.VITE_CLEVERTAP_OFFLINE_MODE === 'true'

let isInitialized = false
const recentEvents = []
const eventListeners = new Set()

function notifyListeners(event) {
  recentEvents.unshift(event)
  if (recentEvents.length > 50) recentEvents.pop()
  eventListeners.forEach((listener) => {
    try {
      listener(event, [...recentEvents])
    } catch (err) {
      console.error('CleverTap listener error:', err)
    }
  })
}

/**
 * Initialize CleverTap Web SDK
 */
export function initCleverTap() {
  if (isInitialized) {
    return clevertap
  }

  try {
    // 1. Enable Single Page Application (SPA) mode
    // Best practice for React / Vue / Angular apps to track route transitions & notifications correctly
    clevertap.spa = true

    // 2. Enable verbose debugging in browser console
    // 0: Disabled, 1: Errors only, 2: Errors + Info, 3: Full verbose logs
    clevertap.setLogLevel(3)

    // Set WZRK_D in sessionStorage to enable maximum communication verbosity
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage['WZRK_D'] = ''
    }

    // 3. Configure Privacy Settings
    clevertap.privacy.push({ optOut: false }) // true if user opts out of analytics
    clevertap.privacy.push({ useIP: true })   // true if user consents to IP resolution for location

    // 4. Initialize account credentials
    clevertap.init(CLEVERTAP_ACCOUNT_ID, CLEVERTAP_REGION)

    // 5. Offline / Live Dispatch Mode
    // When offline, CleverTap queues all events in localStorage without firing failed HTTP requests
    if (isOfflineByDefault) {
      clevertap.setOffline(true)
    } else {
      // Explicitly turn offline mode off so all events are streamed directly to CleverTap dashboard
      clevertap.setOffline(false)
    }

    isInitialized = true

    // Educational banner in console
    console.groupCollapsed(
      '%c[CleverTap Web SDK] 🚀 Initialized in %c' + (isOfflineByDefault ? 'LEARNING / OFFLINE MODE' : 'LIVE DASHBOARD MODE'),
      'color: #ed6a45; font-weight: bold; font-size: 13px;',
      isOfflineByDefault ? 'color: #d97706; font-weight: bold;' : 'color: #16a34a; font-weight: bold;'
    )
    console.log('%cAccount ID:%c ' + CLEVERTAP_ACCOUNT_ID, 'font-weight: bold;', 'color: #6b7280;')
    console.log('%cRegion:%c ' + CLEVERTAP_REGION, 'font-weight: bold;', 'color: #6b7280;')
    console.log('%cOffline Mode Active:%c ' + isOfflineByDefault, 'font-weight: bold;', 'color: #6b7280;')
    console.log('%cSPA Support:%c Enabled (clevertap.spa = true)', 'font-weight: bold;', 'color: #6b7280;')
    if (isOfflineByDefault) {
      console.info(
        '💡 %cWhy Offline Mode?%c In offline mode, the CleverTap SDK queues events locally and you can inspect payloads right here in the console without failed network errors.',
        'font-weight: bold; color: #0284c7;',
        'color: inherit;'
      )
    } else {
      console.info(
        '📡 %cLive Mode Active:%c All events and profile pushes are transmitting live to your CleverTap dashboard (%s)!',
        'font-weight: bold; color: #16a34a;',
        'color: inherit;',
        `https://${CLEVERTAP_REGION}.dashboard.clevertap.com`
      )
    }
    console.groupEnd()

    notifyListeners({
      type: 'INIT',
      timestamp: new Date().toLocaleTimeString(),
      accountId: CLEVERTAP_ACCOUNT_ID,
      region: CLEVERTAP_REGION,
      offline: isOfflineByDefault,
    })
  } catch (error) {
    console.error('[CleverTap Web SDK] Initialization error:', error)
  }

  return clevertap
}

/**
 * Identify User with `clevertap.onUserLogin`
 * 
 * Rules for onUserLogin in CleverTap:
 * - Must be called upon Login or Signup.
 * - Requires at least one unique identifier (Identity, Email, or FBID).
 * - If current user was anonymous, it links the actions to this profile.
 * - If current user was a different identified user, it creates a new profile.
 * - Note on Age: Do NOT pass Age directly. CleverTap automatically calculates Age from DOB!
 * - Category subscriptions can be managed with `category-unsubscribe` and `category-resubscribe`.
 * 
 * @param {Object} profile - User attributes (Name, Email, Identity, Phone, DOB, etc.)
 */
export function identifyUser(profile = {}) {
  initCleverTap()

  // Guard against passing manual Age
  if (profile.Age !== undefined || profile.age !== undefined) {
    console.warn(
      '[CleverTap] 💡 Note: Do not pass "Age" manually. CleverTap calculates Age automatically from "DOB" (Date of Birth).'
    )
  }

  const siteData = {
    Name: profile.name || profile.Name || 'Guest User',
    Email: profile.email || profile.Email,
    Identity: profile.id || profile._id || profile.Identity || profile.email,
    Phone: profile.phone || profile.Phone,
    Gender: profile.gender || profile.Gender, // 'M' or 'F'
    DOB: profile.dob ? (profile.dob instanceof Date ? profile.dob : new Date(profile.dob)) : undefined,
    'Customer Type': profile.customerType || profile['Customer Type'] || 'Registered',
    // Notification subscription controls
    'MSG-email': profile['MSG-email'] !== undefined ? profile['MSG-email'] : true,
    'MSG-push': profile['MSG-push'] !== undefined ? profile['MSG-push'] : true,
    'MSG-sms': profile['MSG-sms'] !== undefined ? profile['MSG-sms'] : true,
    'MSG-whatsapp': profile['MSG-whatsapp'] !== undefined ? profile['MSG-whatsapp'] : true,
  }

  // Category-level email subscription preferences
  if (profile.categoryResubscribe || profile['category-resubscribe']) {
    siteData['category-resubscribe'] = profile.categoryResubscribe || profile['category-resubscribe']
  }
  if (profile.categoryUnsubscribe || profile['category-unsubscribe']) {
    siteData['category-unsubscribe'] = profile.categoryUnsubscribe || profile['category-unsubscribe']
  }

  // Copy any additional custom properties
  Object.keys(profile).forEach((key) => {
    if (!['name', 'Name', 'email', 'Email', 'id', '_id', 'Identity', 'phone', 'Phone', 'gender', 'Gender', 'dob', 'DOB', 'age', 'Age', 'customerType', 'categoryResubscribe', 'categoryUnsubscribe'].includes(key)) {
      siteData[key] = profile[key]
    }
  })

  // Remove undefined fields
  Object.keys(siteData).forEach((key) => {
    if (siteData[key] === undefined) delete siteData[key]
  })

  const payload = { Site: siteData }

  // Dispatch to CleverTap SDK
  clevertap.onUserLogin.push(payload)

  // Rich Console Log for learning
  console.groupCollapsed(
    '%c[CleverTap 👤 onUserLogin]%c ' + (siteData.Name || siteData.Email),
    'color: #0284c7; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log('%cAPI Call:%c clevertap.onUserLogin.push(...)', 'font-weight: bold;', 'color: #6366f1;')
  console.log('%cProfile Data:%c', 'font-weight: bold;', '', payload)
  console.info(
    '💡 %cCleverTap Concept: onUserLogin%c\n' +
    '• Used when a user authenticates (Login/Signup).\n' +
    '• Merges anonymous events with the recognized Identity.\n' +
    '• Notice: Age is automatically computed by CleverTap from DOB (Date of Birth).\n' +
    '• Category preferences: category-unsubscribe & category-resubscribe control granular email categories.',
    'font-weight: bold; color: #0284c7;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'ON_USER_LOGIN',
    timestamp: new Date().toLocaleTimeString(),
    data: payload,
  })

  return payload
}

/**
 * Update Current Profile with `clevertap.profile.push`
 * 
 * Rules for profile.push:
 * - Updates attributes on the currently active profile (does not change Identity).
 * - Ideal for updating preferences, tiers, addresses, loyalty points.
 * - Supported value types: String, Number, Boolean, Date.
 * 
 * @param {Object} attributes - Custom profile properties
 */
export function updateUserProfile(attributes = {}) {
  initCleverTap()

  if (attributes.Age !== undefined || attributes.age !== undefined) {
    console.warn(
      '[CleverTap] 💡 Note: Do not pass "Age" manually. CleverTap calculates Age automatically from "DOB".'
    )
  }

  const siteData = { ...attributes }
  delete siteData.Age
  delete siteData.age

  const payload = {
    Site: siteData,
  }

  clevertap.profile.push(payload)

  console.groupCollapsed(
    '%c[CleverTap 📝 profile.push]%c Updated Profile Attributes',
    'color: #8b5cf6; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log('%cAPI Call:%c clevertap.profile.push(...)', 'font-weight: bold;', 'color: #6366f1;')
  console.log('%cAttributes:%c', 'font-weight: bold;', '', payload)
  console.info(
    '💡 %cCleverTap Concept: profile.push%c\n' +
    '• Appends or updates metadata for the current user profile without re-authenticating.\n' +
    '• Supported types: String, Number (Integer/Float), Boolean, Date object.',
    'font-weight: bold; color: #8b5cf6;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'PROFILE_PUSH',
    timestamp: new Date().toLocaleTimeString(),
    data: payload,
  })

  return payload
}

/**
 * Set User Location with `clevertap.getLocation(lat, lng)`
 * 
 * Behavior:
 * - If `lat` & `lng` are provided, CleverTap validates them and sets `$ct.location`.
 * - If no arguments are provided, CleverTap calls `navigator.geolocation` to auto-detect browser location.
 * - On Safari, permission responses are cached in localStorage (`WZRK_GEO`).
 * 
 * @param {number} [lat] - Optional Latitude (-90 to 90)
 * @param {number} [lng] - Optional Longitude (-180 to 180)
 */
export function setUserLocation(lat, lng) {
  initCleverTap()

  const hasCoords = typeof lat === 'number' && typeof lng === 'number'

  if (hasCoords) {
    clevertap.getLocation(lat, lng)
  } else {
    clevertap.getLocation()
  }

  console.groupCollapsed(
    '%c[CleverTap 📍 getLocation]%c ' + (hasCoords ? `${lat}, ${lng}` : 'Auto-detect via Browser'),
    'color: #059669; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log(
    '%cAPI Call:%c ' + (hasCoords ? `clevertap.getLocation(${lat}, ${lng})` : 'clevertap.getLocation()'),
    'font-weight: bold;',
    'color: #6366f1;'
  )
  console.info(
    '💡 %cCleverTap Concept: User Location%c\n' +
    '• Sets the special "$ct.location" property on the user profile.\n' +
    '• Manual mode validates coordinates (-90 to 90 lat, -180 to 180 lng).\n' +
    '• Auto mode queries the HTML5 Geolocation API.\n' +
    '• Safari note: Permission is saved in localStorage under "WZRK_GEO". Clear this key to test re-prompting.',
    'font-weight: bold; color: #059669;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'LOCATION_UPDATE',
    name: 'Set User Location',
    timestamp: new Date().toLocaleTimeString(),
    data: hasCoords ? { latitude: lat, longitude: lng } : { mode: 'auto-browser-detection' },
  })

  return { lat, lng }
}

/**
 * Increment User Profile Property
 * Uses `clevertap.handleIncrementValue(propName, propValue)`
 * 
 * Useful for scalar numeric properties like loyalty points, total orders, lifetime spend.
 * 
 * @param {string} propName - Name of the numeric property (e.g. "Loyalty Points")
 * @param {number} propValue - Amount to increment by (e.g. 50)
 */
export function incrementProfileProperty(propName, propValue) {
  initCleverTap()

  clevertap.handleIncrementValue(propName, propValue)

  console.groupCollapsed(
    `%c[CleverTap ➕ Increment]%c ${propName} (+${propValue})`,
    'color: #0284c7; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log(
    `%cAPI Call:%c clevertap.handleIncrementValue("${propName}", ${propValue})`,
    'font-weight: bold;',
    'color: #6366f1;'
  )
  console.info(
    '💡 %cCleverTap Concept: Increment Operator%c\n' +
    '• Increments an Integer, Float, or Double user profile property directly on the server.\n' +
    '• Ideal for loyalty reward balances, purchase frequency counts, gamification scores.',
    'font-weight: bold; color: #0284c7;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'INCREMENT_VALUE',
    name: `+${propValue} ${propName}`,
    timestamp: new Date().toLocaleTimeString(),
    data: { property: propName, incrementBy: propValue },
  })
}

/**
 * Decrement User Profile Property
 * Uses `clevertap.handleDecrementValue(propName, propValue)`
 * 
 * @param {string} propName - Name of the numeric property
 * @param {number} propValue - Amount to decrement by
 */
export function decrementProfileProperty(propName, propValue) {
  initCleverTap()

  clevertap.handleDecrementValue(propName, propValue)

  console.groupCollapsed(
    `%c[CleverTap ➖ Decrement]%c ${propName} (-${propValue})`,
    'color: #dc2626; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log(
    `%cAPI Call:%c clevertap.handleDecrementValue("${propName}", ${propValue})`,
    'font-weight: bold;',
    'color: #6366f1;'
  )
  console.info(
    '💡 %cCleverTap Concept: Decrement Operator%c\n' +
    '• Decrements an existing numeric profile property without having to fetch and overwrite the entire profile.',
    'font-weight: bold; color: #dc2626;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'DECREMENT_VALUE',
    name: `-${propValue} ${propName}`,
    timestamp: new Date().toLocaleTimeString(),
    data: { property: propName, decrementBy: propValue },
  })
}

/**

 * Track Custom Event with `clevertap.event.push`
 * 
 * Rules for event.push:
 * - Event name must be a string (e.g. "Product Viewed", "Added to Cart").
 * - Event properties should be scalar values (String, Number, Boolean, or Date).
 * - Record events only after validations succeed.
 * 
 * @param {string} eventName - Name of the event
 * @param {Object} properties - Custom event properties
 */
export function trackEvent(eventName, properties = {}) {
  initCleverTap()

  // Ensure Date object is present for time tracking if not provided
  const eventPayload = {
    ...properties,
    Date: properties.Date || new Date(),
  }

  clevertap.event.push(eventName, eventPayload)

  console.groupCollapsed(
    '%c[CleverTap ⚡ event.push]%c ' + eventName,
    'color: #ed6a45; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log('%cAPI Call:%c clevertap.event.push("' + eventName + '", properties)', 'font-weight: bold;', 'color: #6366f1;')
  console.log('%cProperties:%c', 'font-weight: bold;', '', eventPayload)
  console.info(
    '💡 %cCleverTap Concept: event.push%c\n' +
    '• Tracks user actions & micro-conversions.\n' +
    '• Powers behavioral segments, campaign triggers, and analytics funnels.',
    'font-weight: bold; color: #ed6a45;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'EVENT_PUSH',
    name: eventName,
    timestamp: new Date().toLocaleTimeString(),
    data: eventPayload,
  })

  return { eventName, properties: eventPayload }
}

/**
 * Track E-commerce Order with CleverTap's special `Charged` event
 * 
 * CleverTap has a reserved "Charged" event specifically tailored for transactions:
 * It expects items to be an array of objects representing items purchased,
 * along with transaction metadata (Amount, Payment mode, Charged ID, etc.).
 * 
 * @param {Object} orderDetails - Order summary and items
 */
export function trackCharged(orderDetails) {
  initCleverTap()

  const chargedPayload = {
    'Amount': orderDetails.totalAmount,
    'Subtotal': orderDetails.subtotal,
    'Delivery Fee': orderDetails.deliveryFee,
    'Discount': orderDetails.discountAmount,
    'Coupon Code': orderDetails.couponCode || 'NONE',
    'Restaurant Name': orderDetails.restaurantName,
    'Restaurant ID': orderDetails.restaurantId,
    'Payment Mode': orderDetails.paymentMode || 'Credit Card',
    'Charged ID': orderDetails.orderId || `ORD-${Date.now()}`,
    'Items Count': orderDetails.items?.length || 0,
    'Date': new Date(),
    'Items': (orderDetails.items || []).map((item) => ({
      'Item ID': item.id,
      'Name': item.name,
      'Price': item.price,
      'Quantity': item.quantity,
      'Category': item.category || 'General',
    })),
  }

  clevertap.event.push('Charged', chargedPayload)

  console.groupCollapsed(
    '%c[CleverTap 💳 Charged Event]%c Order Placed ($' + orderDetails.totalAmount + ')',
    'color: #10b981; font-weight: bold; font-size: 12px;',
    'color: #1f2937; font-weight: 600;'
  )
  console.log('%cAPI Call:%c clevertap.event.push("Charged", chargedPayload)', 'font-weight: bold;', 'color: #6366f1;')
  console.log('%cCharged Payload:%c', 'font-weight: bold;', '', chargedPayload)
  console.info(
    '💡 %cCleverTap Concept: Charged Event%c\n' +
    '• "Charged" is CleverTap\'s special revenue-tracking event.\n' +
    '• The "Items" array automatically populates item-level purchase reports in the dashboard.',
    'font-weight: bold; color: #10b981;',
    'color: #4b5563;'
  )
  console.groupEnd()

  notifyListeners({
    type: 'CHARGED_EVENT',
    name: 'Charged',
    timestamp: new Date().toLocaleTimeString(),
    data: chargedPayload,
  })

  return chargedPayload
}

/**
 * Track Page Views (for Single Page Application navigation)
 * 
 * @param {string} pageName - Name or title of the page
 * @param {Object} additionalProps - Optional extra page metadata
 */
export function trackPageView(pageName, additionalProps = {}) {
  return trackEvent('Page Viewed', {
    'Page Name': pageName,
    'URL': typeof window !== 'undefined' ? window.location.href : '',
    'Path': typeof window !== 'undefined' ? window.location.pathname : '',
    ...additionalProps,
  })
}

/**
 * Toggle Offline / Live Mode dynamically
 * 
 * @param {boolean} offline - true to queue locally, false to send to CleverTap servers
 */
export function setOfflineMode(offline) {
  clevertap.setOffline(offline)
  console.info(
    `[CleverTap Web SDK] Offline mode changed to: %c${offline}`,
    'font-weight: bold; color: ' + (offline ? '#d97706' : '#16a34a')
  )
}

/**
 * Get in-memory event history (useful for UI debugger widget)
 */
export function getRecentEvents() {
  return [...recentEvents]
}

/**
 * Subscribe to real-time events for UI notifications
 */
export function subscribeToCleverTapEvents(callback) {
  eventListeners.add(callback)
  return () => eventListeners.delete(callback)
}

/**
 * Get current configured offline state
 */
export function isCleverTapOffline() {
  return isOfflineByDefault
}

/**
 * Get current active CleverTap configuration details
 */
export function getCleverTapConfig() {
  return {
    accountId: CLEVERTAP_ACCOUNT_ID,
    region: CLEVERTAP_REGION,
    isOffline: isOfflineByDefault,
  }
}

/**
 * Direct export of clevertap instance for advanced use-cases
 */
export { clevertap }

