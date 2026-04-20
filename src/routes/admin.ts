// ============================================
// ADMIN DASHBOARD
// Password-protected dashboard showing sales data (Stripe)
// and traffic analytics (Cloudflare Pages API).
//
// Access: /admin → login prompt → dashboard
// Auth: Simple password check (stored as ADMIN_PASSWORD secret)
// ============================================
import { Hono } from 'hono'
import { escHtml } from '../utils/html'

type Bindings = {
  STRIPE_SECRET_KEY?: string
  ADMIN_PASSWORD?: string
  CF_API_TOKEN?: string
  CF_ACCOUNT_ID?: string
}

const admin = new Hono<{ Bindings: Bindings }>()

const STRIPE_API = 'https://api.stripe.com/v1'

// ============================================
// Stripe API helper (mirrors the one in stripe.ts)
// ============================================
async function stripeGet(endpoint: string, secretKey: string): Promise<any> {
  const response = await fetch(`${STRIPE_API}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${secretKey}` },
  })
  return response.json()
}

// ============================================
// AUTH MIDDLEWARE — checks cookie or query param
// ============================================
function getAdminPassword(env: Bindings): string {
  return env.ADMIN_PASSWORD || 'hillbilly2026'
}

function isAuthenticated(c: any): boolean {
  const env = c.env as Bindings
  const password = getAdminPassword(env)
  
  // Check cookie
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/hfw_admin=([^;]+)/)
  if (match && match[1] === encodeURIComponent(password)) {
    return true
  }
  
  return false
}

// ============================================
// LOGIN PAGE
// ============================================
admin.get('/login', (c) => {
  const nonce = c.get('nonce') || ''
  const error = c.req.query('error') ? '<p style="color:#ef4444;margin-bottom:16px;">Incorrect password.</p>' : ''
  
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | Hillbilly Fightwear</title>
  <meta name="robots" content="noindex, nofollow">
  <script src="https://cdn.tailwindcss.com" nonce="${nonce}"></script>
  <script nonce="${nonce}">
    tailwind.config = {
      theme: { extend: { colors: { brand: '#8B0000', dark: '#1a1a1a' } } }
    }
  </script>
</head>
<body class="bg-dark min-h-screen flex items-center justify-center">
  <div class="bg-zinc-900 rounded-xl p-8 w-full max-w-sm shadow-2xl border border-zinc-800">
    <div class="text-center mb-6">
      <h1 class="text-2xl font-bold text-white tracking-wider">HILLBILLY FIGHTWEAR</h1>
      <p class="text-zinc-500 text-sm mt-1">Admin Dashboard</p>
    </div>
    ${error}
    <form method="POST" action="/admin/login">
      <label class="block text-zinc-400 text-sm mb-2">Password</label>
      <input type="password" name="password" autofocus required
        class="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-brand focus:outline-none mb-4"
        placeholder="Enter admin password">
      <button type="submit"
        class="w-full bg-brand hover:bg-red-800 text-white font-bold py-3 rounded-lg transition-colors">
        Sign In
      </button>
    </form>
  </div>
</body>
</html>`)
})

admin.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const password = String(body.password || '')
  const correctPassword = getAdminPassword(c.env as Bindings)
  
  if (password === correctPassword) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/admin',
        'Set-Cookie': `hfw_admin=${encodeURIComponent(password)}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      },
    })
  }
  
  return c.redirect('/admin/login?error=1', 302)
})

admin.get('/logout', (c) => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin/login',
      'Set-Cookie': 'hfw_admin=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    },
  })
})

// ============================================
// API: Sales data from Stripe
// ============================================
admin.get('/api/sales', async (c) => {
  if (!isAuthenticated(c)) return c.json({ error: 'Unauthorized' }, 401)
  
  const env = c.env as Bindings
  if (!env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 500)
  }
  
  const sk = env.STRIPE_SECRET_KEY
  const now = Math.floor(Date.now() / 1000)
  const todayStart = now - (now % 86400)
  const weekStart = todayStart - (6 * 86400)
  const monthStart = todayStart - (29 * 86400)
  
  try {
    // Fetch recent charges (last 100)
    const [charges, balanceTransactions] = await Promise.all([
      stripeGet('/charges?limit=100&expand[]=data.customer', sk),
      stripeGet('/balance/transactions?limit=100&type=charge', sk),
    ])
    
    const chargeList = charges.data || []
    const successfulCharges = chargeList.filter((ch: any) => ch.status === 'succeeded' && !ch.refunded)
    
    // Calculate metrics
    let totalRevenue = 0
    let todayRevenue = 0
    let weekRevenue = 0
    let monthRevenue = 0
    let todayOrders = 0
    let weekOrders = 0
    let monthOrders = 0
    const productCounts: Record<string, { name: string; qty: number; revenue: number }> = {}
    
    for (const ch of successfulCharges) {
      const amount = (ch.amount || 0) / 100
      const created = ch.created || 0
      
      totalRevenue += amount
      
      if (created >= todayStart) {
        todayRevenue += amount
        todayOrders++
      }
      if (created >= weekStart) {
        weekRevenue += amount
        weekOrders++
      }
      if (created >= monthStart) {
        monthRevenue += amount
        monthOrders++
      }
      
      // Extract product info from metadata or description
      const desc = ch.description || ch.metadata?.items || 'Unknown Item'
      if (!productCounts[desc]) {
        productCounts[desc] = { name: desc, qty: 0, revenue: 0 }
      }
      productCounts[desc].qty++
      productCounts[desc].revenue += amount
    }
    
    // Top products sorted by revenue
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
    
    // Recent orders (last 20)
    const recentOrders = successfulCharges.slice(0, 20).map((ch: any) => ({
      id: ch.id,
      amount: ((ch.amount || 0) / 100).toFixed(2),
      currency: (ch.currency || 'usd').toUpperCase(),
      email: ch.billing_details?.email || ch.receipt_email || ch.customer?.email || '—',
      name: ch.billing_details?.name || ch.customer?.name || '—',
      description: ch.description || '—',
      date: new Date((ch.created || 0) * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      time: new Date((ch.created || 0) * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
      }),
      receiptUrl: ch.receipt_url || null,
    }))
    
    // Daily revenue for chart (last 14 days)
    const dailyRevenue: { date: string; revenue: number; orders: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const dayStart = todayStart - (i * 86400)
      const dayEnd = dayStart + 86400
      let dayRev = 0
      let dayOrd = 0
      for (const ch of successfulCharges) {
        if (ch.created >= dayStart && ch.created < dayEnd) {
          dayRev += (ch.amount || 0) / 100
          dayOrd++
        }
      }
      dailyRevenue.push({
        date: new Date(dayStart * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(dayRev * 100) / 100,
        orders: dayOrd,
      })
    }
    
    // Refunds
    const refundedCharges = chargeList.filter((ch: any) => ch.refunded)
    const refundTotal = refundedCharges.reduce((sum: number, ch: any) => sum + ((ch.amount_refunded || 0) / 100), 0)
    
    return c.json({
      overview: {
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders: successfulCharges.length,
        avgOrderValue: successfulCharges.length > 0 ? (totalRevenue / successfulCharges.length).toFixed(2) : '0.00',
        todayRevenue: todayRevenue.toFixed(2),
        todayOrders,
        weekRevenue: weekRevenue.toFixed(2),
        weekOrders,
        monthRevenue: monthRevenue.toFixed(2),
        monthOrders,
        refunds: refundedCharges.length,
        refundTotal: refundTotal.toFixed(2),
      },
      topProducts,
      recentOrders,
      dailyRevenue,
    })
  } catch (err) {
    console.error('[ADMIN] Stripe error:', err)
    return c.json({ error: 'Failed to fetch sales data' }, 500)
  }
})

// ============================================
// API: Stripe checkout sessions (more detailed order info)
// ============================================
admin.get('/api/sessions', async (c) => {
  if (!isAuthenticated(c)) return c.json({ error: 'Unauthorized' }, 401)
  
  const env = c.env as Bindings
  if (!env.STRIPE_SECRET_KEY) {
    return c.json({ error: 'Stripe not configured' }, 500)
  }
  
  try {
    const sessions = await stripeGet(
      '/checkout/sessions?limit=50&expand[]=data.line_items&status=complete',
      env.STRIPE_SECRET_KEY
    )
    
    const sessionList = (sessions.data || []).map((s: any) => ({
      id: s.id,
      amount: ((s.amount_total || 0) / 100).toFixed(2),
      email: s.customer_details?.email || s.customer_email || '—',
      name: s.customer_details?.name || '—',
      items: (s.line_items?.data || []).map((li: any) => ({
        name: li.description || '—',
        qty: li.quantity || 1,
        amount: ((li.amount_total || 0) / 100).toFixed(2),
      })),
      date: new Date((s.created || 0) * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      }),
      paymentStatus: s.payment_status,
    }))
    
    return c.json({ sessions: sessionList })
  } catch (err) {
    console.error('[ADMIN] Sessions error:', err)
    return c.json({ error: 'Failed to fetch sessions' }, 500)
  }
})

// ============================================
// API: Traffic analytics from Cloudflare Zone Analytics
// Requires CF_API_TOKEN with analytics:read + CF_ZONE_ID
// ============================================
const CF_ZONE_ID = 'f6cf84aaf9620dcd00f5a4b9be7271a9'

admin.get('/api/traffic', async (c) => {
  if (!isAuthenticated(c)) return c.json({ error: 'Unauthorized' }, 401)

  const env = c.env as Bindings
  const cfToken = env.CF_API_TOKEN
  
  if (!cfToken) {
    return c.json({
      zoneStatus: 'Active (analytics token not configured)',
      totalRequests: 0, uniqueVisitors: 0, totalBandwidth: 0,
      threats: 0, countries: [], dailyRequests: [],
      note: 'Add CF_API_TOKEN with analytics:read permission to enable traffic data.',
    })
  }

  try {
    // Use Cloudflare GraphQL Analytics API
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const dateFrom = weekAgo.toISOString().split('T')[0]
    const dateTo = now.toISOString().split('T')[0]

    const query = `{
      viewer {
        zones(filter: { zoneTag: "${CF_ZONE_ID}" }) {
          httpRequests1dGroups(
            limit: 7
            filter: { date_geq: "${dateFrom}", date_leq: "${dateTo}" }
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum {
              requests
              bytes
              threats
              pageViews
              countryMap { clientCountryName requests }
            }
            uniq { uniques }
          }
        }
      }
    }`

    const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })

    const cfData = await cfRes.json() as any

    if (cfData.errors && cfData.errors.length > 0) {
      const errMsg = cfData.errors[0].message || 'Unknown analytics error'
      // If permission error, return helpful message
      if (errMsg.includes('permission')) {
        return c.json({
          zoneStatus: 'Active (needs analytics permission)',
          totalRequests: 0, uniqueVisitors: 0, totalBandwidth: 0,
          threats: 0, countries: [], dailyRequests: [],
          note: 'Your CF_API_TOKEN needs "Zone Analytics: Read" permission. Update it in Cloudflare dashboard → Profile → API Tokens.',
        })
      }
      return c.json({ error: errMsg }, 500)
    }

    const groups = cfData?.data?.viewer?.zones?.[0]?.httpRequests1dGroups || []

    let totalRequests = 0
    let totalBandwidth = 0
    let uniqueVisitors = 0
    let totalThreats = 0
    const countryMap: Record<string, number> = {}
    const dailyRequests: { date: string; requests: number }[] = []

    for (const g of groups) {
      const reqs = g.sum?.requests || 0
      totalRequests += reqs
      totalBandwidth += g.sum?.bytes || 0
      totalThreats += g.sum?.threats || 0
      uniqueVisitors += g.uniq?.uniques || 0

      dailyRequests.push({
        date: new Date(g.dimensions.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requests: reqs,
      })

      for (const cm of (g.sum?.countryMap || [])) {
        const country = cm.clientCountryName || 'Unknown'
        countryMap[country] = (countryMap[country] || 0) + cm.requests
      }
    }

    const countries = Object.entries(countryMap)
      .map(([country, requests]) => ({ country, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 15)

    return c.json({
      zoneStatus: 'Active',
      totalRequests,
      uniqueVisitors,
      totalBandwidth,
      threats: totalThreats,
      countries,
      dailyRequests,
    })
  } catch (err) {
    console.error('[ADMIN] Traffic error:', err)
    return c.json({ error: 'Failed to fetch traffic data' }, 500)
  }
})

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
admin.get('/', (c) => {
  if (!isAuthenticated(c)) return c.redirect('/admin/login')
  
  const nonce = c.get('nonce') || ''
  
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | Hillbilly Fightwear</title>
  <meta name="robots" content="noindex, nofollow">
  <script src="https://cdn.tailwindcss.com" nonce="${nonce}"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js" nonce="${nonce}"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <script nonce="${nonce}">
    tailwind.config = {
      theme: { extend: { colors: { brand: '#8B0000', dark: '#1a1a1a', card: '#1e1e1e' } } }
    }
  </script>
  <style>
    .tab-active { border-color: #8B0000; color: #fff; }
    .tab-inactive { border-color: transparent; color: #71717a; }
    .tab-inactive:hover { color: #a1a1aa; }
    .stat-card { background: #1e1e1e; border: 1px solid #2a2a2a; }
    .stat-card:hover { border-color: #3a3a3a; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #1a1a1a; }
    ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
  </style>
</head>
<body class="bg-dark text-white min-h-screen">

  <!-- HEADER -->
  <header class="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold tracking-wider">HILLBILLY FIGHTWEAR</h1>
        <span class="bg-brand/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-medium">ADMIN</span>
      </div>
      <div class="flex items-center gap-4">
        <button id="btn-refresh" class="text-zinc-400 hover:text-white transition-colors" title="Refresh">
          <i class="fas fa-sync-alt"></i>
        </button>
        <a href="/" class="text-zinc-400 hover:text-white text-sm transition-colors">
          <i class="fas fa-external-link-alt mr-1"></i>View Site
        </a>
        <a href="/admin/logout" class="text-zinc-500 hover:text-red-400 text-sm transition-colors">
          <i class="fas fa-sign-out-alt mr-1"></i>Logout
        </a>
      </div>
    </div>
  </header>

  <!-- TABS -->
  <nav class="bg-zinc-900 border-b border-zinc-800">
    <div class="max-w-7xl mx-auto px-4 flex gap-6">
      <button data-tab="sales" id="tab-sales"
        class="py-3 border-b-2 text-sm font-medium transition-colors tab-active">
        <i class="fas fa-dollar-sign mr-1"></i>Sales
      </button>
      <button data-tab="orders" id="tab-orders"
        class="py-3 border-b-2 text-sm font-medium transition-colors tab-inactive">
        <i class="fas fa-shopping-bag mr-1"></i>Orders
      </button>
      <button data-tab="traffic" id="tab-traffic"
        class="py-3 border-b-2 text-sm font-medium transition-colors tab-inactive">
        <i class="fas fa-chart-line mr-1"></i>Traffic
      </button>
    </div>
  </nav>

  <!-- CONTENT -->
  <main class="max-w-7xl mx-auto px-4 py-6">
    
    <!-- LOADING STATE -->
    <div id="loading" class="text-center py-20">
      <i class="fas fa-spinner fa-spin text-3xl text-brand mb-4"></i>
      <p class="text-zinc-500">Loading dashboard data...</p>
    </div>

    <!-- ERROR STATE -->
    <div id="error" class="hidden text-center py-20">
      <i class="fas fa-exclamation-triangle text-3xl text-yellow-500 mb-4"></i>
      <p class="text-zinc-400" id="error-msg">Failed to load data</p>
      <button id="btn-retry" class="mt-4 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm">Retry</button>
    </div>

    <!-- SALES TAB -->
    <div id="panel-sales" class="hidden">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Today</p>
          <p class="text-2xl font-bold text-green-400" id="kpi-today-revenue">$0</p>
          <p class="text-zinc-600 text-xs mt-1"><span id="kpi-today-orders">0</span> orders</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">This Week</p>
          <p class="text-2xl font-bold text-green-400" id="kpi-week-revenue">$0</p>
          <p class="text-zinc-600 text-xs mt-1"><span id="kpi-week-orders">0</span> orders</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Last 30 Days</p>
          <p class="text-2xl font-bold text-green-400" id="kpi-month-revenue">$0</p>
          <p class="text-zinc-600 text-xs mt-1"><span id="kpi-month-orders">0</span> orders</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Avg Order</p>
          <p class="text-2xl font-bold text-white" id="kpi-avg-order">$0</p>
          <p class="text-zinc-600 text-xs mt-1"><span id="kpi-total-orders">0</span> total orders</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Total Revenue</p>
          <p class="text-3xl font-bold text-white" id="kpi-total-revenue">$0</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Refunds</p>
          <p class="text-2xl font-bold text-red-400" id="kpi-refunds">0</p>
          <p class="text-zinc-600 text-xs mt-1">$<span id="kpi-refund-total">0</span> refunded</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Net Revenue</p>
          <p class="text-2xl font-bold text-green-400" id="kpi-net-revenue">$0</p>
        </div>
      </div>

      <div class="stat-card rounded-xl p-4 mb-6">
        <h3 class="text-sm font-medium text-zinc-400 mb-3">Revenue — Last 14 Days</h3>
        <div style="height: 250px;">
          <canvas id="revenue-chart"></canvas>
        </div>
      </div>

      <div class="stat-card rounded-xl p-4">
        <h3 class="text-sm font-medium text-zinc-400 mb-3">Top Products</h3>
        <div id="top-products" class="space-y-2">
          <p class="text-zinc-600 text-sm">No data yet</p>
        </div>
      </div>
    </div>

    <!-- ORDERS TAB -->
    <div id="panel-orders" class="hidden">
      <div class="stat-card rounded-xl overflow-hidden">
        <div class="p-4 border-b border-zinc-800">
          <h3 class="text-sm font-medium text-zinc-400">Recent Orders</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-zinc-800/50">
              <tr>
                <th class="text-left px-4 py-3 text-zinc-500 font-medium">Date</th>
                <th class="text-left px-4 py-3 text-zinc-500 font-medium">Customer</th>
                <th class="text-left px-4 py-3 text-zinc-500 font-medium">Description</th>
                <th class="text-right px-4 py-3 text-zinc-500 font-medium">Amount</th>
                <th class="text-center px-4 py-3 text-zinc-500 font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody id="orders-table">
              <tr><td colspan="5" class="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TRAFFIC TAB -->
    <div id="panel-traffic" class="hidden">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Zone Status</p>
          <p class="text-xl font-bold" id="traffic-zone-status">Checking...</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Total Requests</p>
          <p class="text-2xl font-bold text-blue-400" id="traffic-requests">—</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Unique Visitors</p>
          <p class="text-2xl font-bold text-blue-400" id="traffic-visitors">—</p>
        </div>
        <div class="stat-card rounded-xl p-4">
          <p class="text-zinc-500 text-xs uppercase tracking-wide mb-1">Bandwidth</p>
          <p class="text-2xl font-bold text-blue-400" id="traffic-bandwidth">—</p>
        </div>
      </div>

      <div class="stat-card rounded-xl p-4 mb-6">
        <h3 class="text-sm font-medium text-zinc-400 mb-3">Requests — Last 7 Days</h3>
        <div style="height: 250px;">
          <canvas id="traffic-chart"></canvas>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="stat-card rounded-xl p-4">
          <h3 class="text-sm font-medium text-zinc-400 mb-3">Top Countries</h3>
          <div id="traffic-countries" class="space-y-2">
            <p class="text-zinc-600 text-sm">Loading...</p>
          </div>
        </div>
        <div class="stat-card rounded-xl p-4">
          <h3 class="text-sm font-medium text-zinc-400 mb-3">Threats Blocked</h3>
          <div id="traffic-threats" class="space-y-2">
            <p class="text-zinc-600 text-sm">Loading...</p>
          </div>
        </div>
      </div>
    </div>

  </main>

  <footer class="max-w-7xl mx-auto px-4 py-6 text-center">
    <p class="text-zinc-700 text-xs">Hillbilly Fightwear Admin Dashboard &middot; Data from Stripe &amp; Cloudflare APIs</p>
  </footer>

  <script nonce="${nonce}">
    (function() {
      var salesData = null;
      var revenueChart = null;
      var trafficChart = null;
      var activeTab = 'sales';

      // ---- Bind tab buttons via addEventListener (CSP-safe) ----
      document.querySelectorAll('[data-tab]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          switchTab(btn.getAttribute('data-tab'));
        });
      });
      document.getElementById('btn-refresh').addEventListener('click', function() { loadData(); });
      document.getElementById('btn-retry').addEventListener('click', function() { loadData(); });

      function switchTab(tab) {
        activeTab = tab;
        ['sales', 'orders', 'traffic'].forEach(function(t) {
          document.getElementById('panel-' + t).classList.add('hidden');
          document.getElementById('tab-' + t).className = 'py-3 border-b-2 text-sm font-medium transition-colors tab-inactive';
        });
        document.getElementById('panel-' + tab).classList.remove('hidden');
        document.getElementById('tab-' + tab).className = 'py-3 border-b-2 text-sm font-medium transition-colors tab-active';
      }

      function fmt(val) {
        return '$' + parseFloat(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      }

      function fmtBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(2) + ' GB';
      }

      // ---- Load all data ----
      async function loadData() {
        var loading = document.getElementById('loading');
        var error = document.getElementById('error');
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        ['sales', 'orders', 'traffic'].forEach(function(t) {
          document.getElementById('panel-' + t).classList.add('hidden');
        });

        try {
          // Fetch sales + traffic in parallel
          var results = await Promise.allSettled([
            fetch('/admin/api/sales'),
            fetch('/admin/api/traffic')
          ]);

          var salesRes = results[0];
          var trafficRes = results[1];

          // Handle sales
          if (salesRes.status === 'fulfilled') {
            if (salesRes.value.status === 401) {
              window.location.href = '/admin/login';
              return;
            }
            if (salesRes.value.ok) {
              salesData = await salesRes.value.json();
              renderSales(salesData);
            }
          }

          // Handle traffic
          if (trafficRes.status === 'fulfilled' && trafficRes.value.ok) {
            var trafficData = await trafficRes.value.json();
            renderTraffic(trafficData);
          } else {
            renderTrafficUnavailable();
          }

          loading.classList.add('hidden');
          document.getElementById('panel-' + activeTab).classList.remove('hidden');

        } catch (err) {
          loading.classList.add('hidden');
          error.classList.remove('hidden');
          document.getElementById('error-msg').textContent = err.message || 'Failed to load data';
        }
      }

      // ---- Render sales ----
      function renderSales(data) {
        var o = data.overview;
        document.getElementById('kpi-today-revenue').textContent = fmt(o.todayRevenue);
        document.getElementById('kpi-today-orders').textContent = o.todayOrders;
        document.getElementById('kpi-week-revenue').textContent = fmt(o.weekRevenue);
        document.getElementById('kpi-week-orders').textContent = o.weekOrders;
        document.getElementById('kpi-month-revenue').textContent = fmt(o.monthRevenue);
        document.getElementById('kpi-month-orders').textContent = o.monthOrders;
        document.getElementById('kpi-avg-order').textContent = fmt(o.avgOrderValue);
        document.getElementById('kpi-total-orders').textContent = o.totalOrders;
        document.getElementById('kpi-total-revenue').textContent = fmt(o.totalRevenue);
        document.getElementById('kpi-refunds').textContent = o.refunds;
        document.getElementById('kpi-refund-total').textContent = o.refundTotal;
        document.getElementById('kpi-net-revenue').textContent = fmt((parseFloat(o.totalRevenue) - parseFloat(o.refundTotal)).toFixed(2));

        // Revenue chart
        var ctx = document.getElementById('revenue-chart').getContext('2d');
        if (revenueChart) revenueChart.destroy();
        revenueChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.dailyRevenue.map(function(d) { return d.date; }),
            datasets: [{
              label: 'Revenue',
              data: data.dailyRevenue.map(function(d) { return d.revenue; }),
              backgroundColor: 'rgba(139, 0, 0, 0.6)',
              borderColor: '#8B0000',
              borderWidth: 1,
              borderRadius: 4,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#1e1e1e', borderColor: '#333', borderWidth: 1,
                titleColor: '#fff', bodyColor: '#a1a1aa',
                callbacks: {
                  label: function(tip) {
                    var d = data.dailyRevenue[tip.dataIndex];
                    return ' $' + d.revenue.toFixed(2) + ' (' + d.orders + ' orders)';
                  }
                }
              }
            },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 } } },
              y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 }, callback: function(v) { return '$' + v; } }, beginAtZero: true }
            }
          }
        });

        // Top products
        var container = document.getElementById('top-products');
        if (data.topProducts.length === 0) {
          container.innerHTML = '<p class="text-zinc-600 text-sm">No sales data yet</p>';
        } else {
          var maxRev = Math.max.apply(null, data.topProducts.map(function(p) { return p.revenue; }));
          container.innerHTML = data.topProducts.map(function(p, i) {
            var pct = maxRev > 0 ? (p.revenue / maxRev * 100) : 0;
            return '<div class="flex items-center gap-3">'
              + '<span class="text-zinc-600 text-xs w-5 text-right">' + (i + 1) + '</span>'
              + '<div class="flex-1">'
              + '<div class="flex justify-between items-center mb-1">'
              + '<span class="text-sm text-zinc-300 truncate max-w-xs">' + escapeHtml(p.name) + '</span>'
              + '<span class="text-sm font-medium text-green-400">' + fmt(p.revenue) + '</span>'
              + '</div>'
              + '<div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">'
              + '<div class="h-full bg-brand rounded-full" style="width:' + pct + '%"></div>'
              + '</div>'
              + '<p class="text-zinc-600 text-xs mt-0.5">' + p.qty + ' sold</p>'
              + '</div></div>';
          }).join('');
        }

        // Orders table
        var tbody = document.getElementById('orders-table');
        if (data.recentOrders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-8 text-center text-zinc-600">No orders yet</td></tr>';
        } else {
          tbody.innerHTML = data.recentOrders.map(function(ord) {
            return '<tr class="border-t border-zinc-800/50 hover:bg-zinc-800/30">'
              + '<td class="px-4 py-3"><div class="text-zinc-300">' + escapeHtml(ord.date) + '</div><div class="text-zinc-600 text-xs">' + escapeHtml(ord.time) + '</div></td>'
              + '<td class="px-4 py-3"><div class="text-zinc-300">' + escapeHtml(ord.name) + '</div><div class="text-zinc-600 text-xs">' + escapeHtml(ord.email) + '</div></td>'
              + '<td class="px-4 py-3 text-zinc-400 max-w-xs truncate">' + escapeHtml(ord.description) + '</td>'
              + '<td class="px-4 py-3 text-right font-medium text-green-400">$' + ord.amount + '</td>'
              + '<td class="px-4 py-3 text-center">' + (ord.receiptUrl
                ? '<a href="' + ord.receiptUrl + '" target="_blank" class="text-brand hover:text-red-400"><i class="fas fa-receipt"></i></a>'
                : '<span class="text-zinc-700">\\u2014</span>') + '</td>'
              + '</tr>';
          }).join('');
        }
      }

      // ---- Render traffic ----
      function renderTraffic(data) {
        if (data.error) {
          renderTrafficUnavailable(data.error);
          return;
        }

        document.getElementById('traffic-zone-status').textContent = data.zoneStatus || 'Active';
        document.getElementById('traffic-zone-status').className = 'text-xl font-bold text-green-400';
        document.getElementById('traffic-requests').textContent = (data.totalRequests || 0).toLocaleString();
        document.getElementById('traffic-visitors').textContent = (data.uniqueVisitors || 0).toLocaleString();
        document.getElementById('traffic-bandwidth').textContent = fmtBytes(data.totalBandwidth || 0);

        // Countries
        var countriesEl = document.getElementById('traffic-countries');
        if (data.countries && data.countries.length > 0) {
          countriesEl.innerHTML = data.countries.slice(0, 10).map(function(c) {
            return '<div class="flex justify-between"><span class="text-zinc-300 text-sm">' + escapeHtml(c.country) + '</span><span class="text-blue-400 text-sm font-medium">' + c.requests.toLocaleString() + '</span></div>';
          }).join('');
        } else {
          countriesEl.innerHTML = '<p class="text-zinc-600 text-sm">No data yet</p>';
        }

        // Threats
        var threatsEl = document.getElementById('traffic-threats');
        threatsEl.innerHTML = '<p class="text-2xl font-bold text-green-400">' + (data.threats || 0).toLocaleString() + '</p><p class="text-zinc-600 text-xs mt-1">threats blocked (last 7 days)</p>';

        // Traffic chart
        if (data.dailyRequests && data.dailyRequests.length > 0) {
          var tCtx = document.getElementById('traffic-chart').getContext('2d');
          if (trafficChart) trafficChart.destroy();
          trafficChart = new Chart(tCtx, {
            type: 'line',
            data: {
              labels: data.dailyRequests.map(function(d) { return d.date; }),
              datasets: [{
                label: 'Requests',
                data: data.dailyRequests.map(function(d) { return d.requests; }),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59,130,246,0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#52525b', font: { size: 11 } }, beginAtZero: true }
              }
            }
          });
        }
      }

      function renderTrafficUnavailable(msg) {
        document.getElementById('traffic-zone-status').textContent = 'Pending';
        document.getElementById('traffic-zone-status').className = 'text-xl font-bold text-yellow-500';
        document.getElementById('traffic-requests').textContent = '\\u2014';
        document.getElementById('traffic-visitors').textContent = '\\u2014';
        document.getElementById('traffic-bandwidth').textContent = '\\u2014';
        document.getElementById('traffic-countries').innerHTML = '<p class="text-zinc-600 text-sm">' + escapeHtml(msg || 'Zone not yet active. Check Cloudflare dashboard.') + '</p>';
        document.getElementById('traffic-threats').innerHTML = '<p class="text-zinc-600 text-sm">\\u2014</p>';
      }

      // ---- Init ----
      loadData();
    })();
  </script>
</body>
</html>`)
})

export default admin
