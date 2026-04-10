import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { supabase } from '../supabaseClient'
import { fmt, getDaysInMonth, getDaysElapsed, getAlerts } from '../utils'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

export default function Dashboard({ session, navigate }) {
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
      .from('budgets')
      .select('*')
      .eq('user_id', uid).eq('month', month).eq('year', year)
      .single()

    setBudget(bud || null)

    if (bud) {
      const { data: cats } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', bud.id)
      setCategories(cats || [])

      const start = `${year}-${String(month).padStart(2,'0')}-01`
      const end   = `${year}-${String(month).padStart(2,'0')}-31`
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .gte('date', start).lte('date', end)
        .order('date', { ascending: false })
      setTransactions(txns || [])
    } else {
      setCategories([])
      setTransactions([])
    }

    setLoading(false)
  }

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  // Aggregate spending by category
  const spentByCategory = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    if (t.category_id) spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount)
  })

  const totalBudgeted = categories.reduce((s, c) => s + Number(c.budgeted_amount), 0)
  const totalSpent    = Object.values(spentByCategory).reduce((s, v) => s + v, 0)
  const income        = budget ? Number(budget.income) : 0
  const remaining     = income - totalSpent

  // Bar chart data
  const chartData = categories.map(c => ({
    name: c.name.length > 10 ? c.name.slice(0,10) + '…' : c.name,
    Budgeted: Number(c.budgeted_amount),
    Spent:    spentByCategory[c.id] || 0,
  }))

  // Pie chart data
  const pieData = categories
    .filter(c => spentByCategory[c.id] > 0)
    .map(c => ({ name: c.name, value: spentByCategory[c.id] || 0, color: c.color }))

  const alerts = budget
    ? getAlerts(budget, categories, transactions, month, year)
    : []

  const daysElapsed = getDaysElapsed(month, year)
  const daysInMonth = getDaysInMonth(month, year)
  const spendingPace = daysElapsed > 0 ? (totalSpent / daysElapsed) * daysInMonth : 0

  if (loading) {
    return <div className="loading-screen" style={{ height: 'calc(100vh - 60px)' }}><div className="loading-spinner" /></div>
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your financial overview for {MONTHS[month-1]} {year}</p>
        </div>
        <div className="month-nav">
          <button onClick={() => changeMonth(-1)}>‹</button>
          <span className="month-label">{MONTHS[month-1]} {year}</span>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>
      </div>

      {!budget ? (
        <div className="card empty-state">
          <div style={{ fontSize: 48 }}>📝</div>
          <p style={{ fontSize: 16, color: 'var(--text)', marginTop: 8 }}>No budget set for {MONTHS[month-1]} {year}</p>
          <p>Set up your income and spending categories to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('budget')}>
            Set Up Budget
          </button>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Monthly Income</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{fmt(income)}</div>
              <div className="stat-sub">Gross monthly income</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Budgeted</div>
              <div className="stat-value">{fmt(totalBudgeted)}</div>
              <div className="stat-sub">Across {categories.length} categories</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Spent So Far</div>
              <div className="stat-value" style={{ color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--text)' }}>
                {fmt(totalSpent)}
              </div>
              <div className="stat-sub">Day {daysElapsed} of {daysInMonth}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Remaining</div>
              <div className="stat-value" style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)' }}>
                {fmt(remaining)}
              </div>
              <div className="stat-sub">
                {remaining < 0 ? '⚠️ Over budget' : 'On track'}
              </div>
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header">
                <span className="card-title">🔔 Active Alerts</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('alerts')}>View All</button>
              </div>
              {alerts.slice(0, 3).map((a, i) => (
                <div key={i} className={`alert-item ${a.level}`}>
                  <span className="alert-icon">{a.icon}</span>
                  <div>
                    <div className="alert-title">{a.title}</div>
                    <div className="alert-desc">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Charts row */}
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Bar chart */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Budget vs Actual</span>
              </div>
              {chartData.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <p>No categories yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                      formatter={v => fmt(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Budgeted" fill="#C9A84C" radius={[4,4,0,0]} />
                    <Bar dataKey="Spent"    fill="#22c55e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie chart */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Spending Breakdown</span>
              </div>
              {pieData.length === 0 ? (
                <div className="empty-state" style={{ padding: 32 }}>
                  <p>No spending logged yet</p>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('transactions')}>
                    Log a Transaction
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color || `hsl(${i*40},70%,55%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => fmt(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Category progress */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Category Progress</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Day {daysElapsed}/{daysInMonth}</span>
            </div>
            {categories.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}><p>No categories defined</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {categories.map(cat => {
                  const spent  = spentByCategory[cat.id] || 0
                  const budget = Number(cat.budgeted_amount)
                  const pct    = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
                  const over   = spent > budget
                  const color  = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : cat.color || 'var(--accent)'
                  return (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="color-dot" style={{ background: cat.color || 'var(--accent)' }} />
                          {cat.name}
                        </span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>
                          <span style={{ color: over ? 'var(--danger)' : 'var(--text)' }}>{fmt(spent)}</span>
                          <span style={{ color: 'var(--text-muted)' }}> / {fmt(budget)}</span>
                          {over && <span className="badge badge-danger" style={{ marginLeft: 8 }}>Over!</span>}
                        </span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Transactions</span>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('transactions')}>View All</button>
            </div>
            {transactions.length === 0 ? (
              <div className="empty-state" style={{ padding: 24 }}>
                <p>No transactions this month</p>
                <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('transactions')}>
                  Add Transaction
                </button>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 8).map(t => {
                      const cat = categories.find(c => c.id === t.category_id)
                      return (
                        <tr key={t.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{t.date}</td>
                          <td>{t.description || '—'}</td>
                          <td>
                            {cat ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="color-dot" style={{ background: cat.color }} />
                                {cat.name}
                              </span>
                            ) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: t.type === 'income' ? 'var(--success)' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                            {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
