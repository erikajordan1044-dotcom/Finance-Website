import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { fmt, getAlerts, getDaysElapsed, getDaysInMonth } from '../utils'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

export default function AlertsPanel({ session, navigate }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [budget, setBudget]         = useState(null)
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [month, year])

  const load = async () => {
    setLoading(true)
    const uid = session.user.id
    const { data: bud } = await supabase
      .from('budgets').select('*')
      .eq('user_id', uid).eq('month', month).eq('year', year).single()

    setBudget(bud || null)

    if (bud) {
      const [{ data: cats }, { data: txns }] = await Promise.all([
        supabase.from('budget_categories').select('*').eq('budget_id', bud.id),
        supabase.from('transactions').select('*')
          .eq('user_id', uid)
          .gte('date', `${year}-${String(month).padStart(2,'0')}-01`)
          .lte('date', `${year}-${String(month).padStart(2,'0')}-31`)
      ])
      setCategories(cats || [])
      setTransactions(txns || [])
    } else {
      setCategories([]); setTransactions([])
    }
    setLoading(false)
  }

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  const alerts = budget ? getAlerts(budget, categories, transactions, month, year) : []

  const dangers  = alerts.filter(a => a.level === 'danger')
  const warnings = alerts.filter(a => a.level === 'warning')
  const infos    = alerts.filter(a => a.level === 'success')

  if (loading) return (
    <div className="loading-screen" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="loading-spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Alerts</h1>
          <p className="page-subtitle">Smart insights about your spending</p>
        </div>
        <div className="month-nav">
          <button onClick={() => changeMonth(-1)}>‹</button>
          <span className="month-label">{MONTHS[month-1]} {year}</span>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>
      </div>

      {!budget ? (
        <div className="card empty-state">
          <div style={{ fontSize: 48 }}>🔔</div>
          <p style={{ fontSize: 16, color: 'var(--text)' }}>No budget for {MONTHS[month-1]} {year}</p>
          <p>Set up your budget to start receiving smart alerts.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('budget')}>
            Set Up Budget
          </button>
        </div>
      ) : (
        <>
          {/* Alert count summary */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <div className="stat-card" style={{ borderColor: dangers.length ? 'var(--danger)' : 'var(--border)' }}>
              <div className="stat-label">Critical</div>
              <div className="stat-value" style={{ color: 'var(--danger)', fontSize: 36 }}>{dangers.length}</div>
              <div className="stat-sub">Require immediate attention</div>
            </div>
            <div className="stat-card" style={{ borderColor: warnings.length ? 'var(--warning)' : 'var(--border)' }}>
              <div className="stat-label">Warnings</div>
              <div className="stat-value" style={{ color: 'var(--warning)', fontSize: 36 }}>{warnings.length}</div>
              <div className="stat-sub">Getting close to limits</div>
            </div>
            <div className="stat-card" style={{ borderColor: 'var(--success)' }}>
              <div className="stat-label">On Track</div>
              <div className="stat-value" style={{ color: 'var(--success)', fontSize: 36 }}>{infos.length}</div>
              <div className="stat-sub">Looking good</div>
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64 }}>🎉</div>
              <p style={{ fontSize: 18, fontWeight: 600, marginTop: 16, color: 'var(--text)' }}>
                All clear!
              </p>
              <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
                No alerts for {MONTHS[month-1]} {year}. You're on track with your budget.
              </p>
            </div>
          ) : (
            <div>
              {dangers.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 12, color: 'var(--danger)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    🚨 Critical Alerts
                  </h3>
                  {dangers.map((a, i) => (
                    <div key={i} className="alert-item danger">
                      <span className="alert-icon">{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div className="alert-title">{a.title}</div>
                        <div className="alert-desc">{a.desc}</div>
                      </div>
                      {a.actionLabel && (
                        <button className="btn btn-sm btn-danger" onClick={() => navigate(a.actionPage)}>
                          {a.actionLabel}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ marginBottom: 12, color: 'var(--warning)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ⚠️ Warnings
                  </h3>
                  {warnings.map((a, i) => (
                    <div key={i} className="alert-item warning">
                      <span className="alert-icon">{a.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div className="alert-title">{a.title}</div>
                        <div className="alert-desc">{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {infos.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: 12, color: 'var(--success)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ✅ On Track
                  </h3>
                  {infos.map((a, i) => (
                    <div key={i} className="alert-item success">
                      <span className="alert-icon">{a.icon}</span>
                      <div>
                        <div className="alert-title">{a.title}</div>
                        <div className="alert-desc">{a.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Per-category spending pace */}
          {categories.length > 0 && (
            <div className="card" style={{ marginTop: 24 }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Category Spending Pace</div>
              {(() => {
                const daysElapsed = getDaysElapsed(month, year)
                const daysInMonth = getDaysInMonth(month, year)
                const spentByCat = {}
                transactions.filter(t => t.type === 'expense').forEach(t => {
                  if (t.category_id) spentByCat[t.category_id] = (spentByCat[t.category_id] || 0) + Number(t.amount)
                })
                const dayFraction = daysElapsed / daysInMonth

                return categories.map(cat => {
                  const spent     = spentByCat[cat.id] || 0
                  const budgeted  = Number(cat.budgeted_amount)
                  const pace      = budgeted > 0 ? (spent / budgeted) : 0
                  const expected  = budgeted * dayFraction
                  const onPace    = spent <= expected * 1.05
                  const overBudget = spent > budgeted

                  return (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                      <span className="color-dot" style={{ background: cat.color, width: 12, height: 12 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                          <span style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                            {fmt(spent)} / {fmt(budgeted)}
                            <span className={`badge ${overBudget ? 'badge-danger' : onPace ? 'badge-success' : 'badge-warning'}`} style={{ marginLeft: 8 }}>
                              {overBudget ? 'Over!' : onPace ? 'On pace' : 'Ahead'}
                            </span>
                          </span>
                        </div>
                        <div className="progress-bar-wrap">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(pace * 100, 100)}%`,
                              background: overBudget ? 'var(--danger)' : pace > 0.8 ? 'var(--warning)' : cat.color
                            }}
                          />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          Expected by day {daysElapsed}: {fmt(expected)} · {Math.round(pace * 100)}% used
                        </div>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </>
      )}
    </div>
  )
}
