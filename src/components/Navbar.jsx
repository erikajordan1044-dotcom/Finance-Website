import React from 'react'
import { supabase } from '../supabaseClient'

const NAV_ITEMS = [
  { id: 'dashboard',    label: '📊 Dashboard' },
  { id: 'budget',       label: '📝 Budget Setup' },
  { id: 'transactions', label: '💳 Transactions' },
  { id: 'projections',  label: '📈 Projections' },
  { id: 'alerts',       label: '🔔 Alerts' },
]

export default function Navbar({ session, currentPage, navigate }) {
  const [signingOut, setSigningOut] = React.useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-logo">💰 BudgetWise</div>
      <div className="navbar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-btn${currentPage === item.id ? ' active' : ''}`}
            onClick={() => navigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="navbar-right">
        <span className="navbar-email">{session.user.email}</span>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? '...' : 'Sign Out'}
        </button>
      </div>
    </nav>
  )
}
