import React from 'react'
import { supabase } from '../supabaseClient'

// Configure these in .env.local:
// VITE_STRIPE_MONTHLY_LINK=https://buy.stripe.com/your_monthly_link
// VITE_STRIPE_ANNUAL_LINK=https://buy.stripe.com/your_annual_link
// The success URL in your Stripe payment link should be:
//   https://your-app.com/?payment_success=true

const MONTHLY_LINK = import.meta.env.VITE_STRIPE_MONTHLY_LINK || '#'
const ANNUAL_LINK  = import.meta.env.VITE_STRIPE_ANNUAL_LINK  || '#'

const FEATURES = [
  'Full budget setup (income + categories)',
  'Unlimited transaction logging',
  '12-month financial projections',
  'Smart overspend / underspend alerts',
  'Monthly & annual budget comparison',
  'Savings goal tracking',
]

export default function Pricing({ session, onRefreshProfile }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleSubscribe = (link) => {
    if (link === '#') {
      alert('Stripe links not configured yet. Add VITE_STRIPE_MONTHLY_LINK and VITE_STRIPE_ANNUAL_LINK to your .env.local file.')
      return
    }
    // Append user email as a pre-fill and client_reference_id for webhook matching
    const url = new URL(link)
    url.searchParams.set('prefilled_email', session.user.email)
    url.searchParams.set('client_reference_id', session.user.id)
    window.location.href = url.toString()
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <div style={{ fontSize: 32, marginBottom: 12 }}>💰 BudgetWise</div>
        <h1>Take control of your finances</h1>
        <p>
          Logged in as <strong>{session.user.email}</strong>.<br />
          Subscribe to unlock your full budget dashboard.
        </p>
      </div>

      <div className="pricing-grid">
        {/* Monthly */}
        <div className="pricing-card">
          <div className="pricing-plan-name">Monthly</div>
          <div className="pricing-amount">
            $9.99<span> / month</span>
          </div>
          <div className="pricing-save" style={{ visibility: 'hidden' }}>—</div>
          <ul className="pricing-features">
            {FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <button
            className="btn btn-secondary"
            onClick={() => handleSubscribe(MONTHLY_LINK)}
          >
            Get Started
          </button>
        </div>

        {/* Annual */}
        <div className="pricing-card featured">
          <div className="pricing-badge">Best Value</div>
          <div className="pricing-plan-name">Annual</div>
          <div className="pricing-amount">
            $79.99<span> / year</span>
          </div>
          <div className="pricing-save">Save 33% — only $6.67/month</div>
          <ul className="pricing-features">
            {FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <button
            className="btn btn-primary"
            onClick={() => handleSubscribe(ANNUAL_LINK)}
          >
            Get Started
          </button>
        </div>
      </div>

      <p className="pricing-signout">
        Not the right account?{' '}
        <button onClick={handleSignOut}>Sign out</button>
      </p>

      {/* Dev bypass — remove in production */}
      {import.meta.env.DEV && (
        <div style={{ marginTop: 40, padding: 16, background: 'var(--bg-card)', borderRadius: 8, border: '1px dashed var(--border)', maxWidth: 480, textAlign: 'center' }}>
          <p style={{ color: 'var(--warning)', fontSize: 13, marginBottom: 10 }}>
            🛠 Dev mode: Activate subscription without payment
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={async () => {
              await supabase.from('profiles').upsert({
                id: session.user.id,
                email: session.user.email,
                subscription_status: 'active',
                subscription_plan: 'monthly',
              })
              onRefreshProfile()
            }}
          >
            Activate Free (Dev Only)
          </button>
        </div>
      )}
    </div>
  )
}
