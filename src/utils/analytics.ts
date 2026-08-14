// GA4 measurement ID (G-XXXXXXXXXX). Empty string = GA4 disabled site-wide.
// Set it once here; the homepage consent hook and the checkout success page
// both read it. Analytics only loads after the visitor grants analytics
// consent in the cookie banner.
export const GA4_ID = ''

// Cloudflare Web Analytics beacon (cookieless, no PII — no consent gate
// needed). Manual snippet because CF's auto-injection only works on static
// HTML, and every HFW page is rendered by the Worker. Public client token
// from dashboard → Analytics → Web analytics → hillbillyfightwear.com site.
export const CF_BEACON = `<script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "ff64f8b6c4e44205a9eae86fa36f0c76"}'></script>`
