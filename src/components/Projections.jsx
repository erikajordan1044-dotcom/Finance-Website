import React, { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import { supabase } from '../supabaseClient'
import { fmt, getDaysInMonth, getDaysElapsed } from '../utils'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function Projections({ session }) {
  const now = new Date()
  const [data, setData] = useState([])
  const [currentBudget, setCurrentBudget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingsGoal, setSavingsGoal] = useState('')
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const uid = session.user.id

    // Fetch last 6 months of budgets + transactions for history
    const historyMonths = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      historyMonths.push({ month: d.getMonth() + 1, year: d.getFullYear() })
    }

    const budgetResults = await Promise.all(
      historyMonths.map(({ month, year }) =>
        supabase.from('budgets').select('*').eq('user_id', uid).eq('month', month).eq('year', year).single()
      )
    )

    const txnResults = await Promise.all(
      historyMonths.map(({ month, year }) => {
        const start = `${year}-${String(month).padStart(2,'0')}-01`
        const end   = `${year}-${String(month).padStart(2,'0')}-31`
        return supabase.from('transactions').select('amount,type').eq('user_id', uid).gte('date', start).lte('date', end)
      })
    )

    const historicalData = historyMonths.map(({ month, year }, i) => {
      const bud  = budgetResults[i].data
      const txns = txnResults[i].data || []
      const income  = bud ? Number(bud.income) : 0
      const spent   = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      const savings = income - spent
      return { month, year, income, spent, savings, label: `${MONTH_NAMES[month-1]} ${year}` }
    })

    // Current month data for projection
    const curIdx = historicalData.length - 1
    const cur = historicalData[curIdx]
    setCurrentBudget(cur)

    const daysElapsed = getDaysElapsed(cur.month, cur.year)
    const daysInMonth = getDaysInMonth(cur.month, cur.year)
    const dailySpend  = daysElapsed > 0 ? cur.spent / daysElapsed : 0
    const projectedSpend = dailySpend * daysInMonth

    // Build 12-month forward projection
    let cumulativeSavings = historicalData.reduce((s, d) => s + d.savings, 0)
    const projectedMonths = []

    for (let i = 1; i <= 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
      const monthlyIncome  = cur.income || 0
      const monthlySpend   = projectedSpend || 0
      const monthlySavings = monthlyIncome - monthlySpend
      cumulativeSavings += monthlySavings
      projectedMonths.push({
        label,
        Income:     monthlyIncome,
        Spending:   Math.round(monthlySpend * 100) / 100,
        Savings:    Math.max(0, Math.round(monthlySavings * 100) / 100),
        Cumulative: Math.round(cumulativeSavings * 100) / 100,
        projected:  true,
      })
    }

    const allData = [
      ...historicalData.map(d => ({
        label: d.label,
        Income:    d.income,
        Spending:  d.spent,
        Savings:   Math.max(0, d.savings),
        Cumulative: 0, // filled below
        projected: false,
      })),
      ...projectedMonths
    ]

    // Fill cumulative for historical
    let cum = 0
    allData.forEach((d, i) => {
      if (!d.projected) {
        cum += (d.Income - d.Spending)
        allData[i].Cumulative = Math.round(cum * 100) / 100
      }
    })

    setData(allData)
    setLoading(false)
  }

  if (loading) return (
    <div className="loading-screen" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="loading-spinner" />
    </div>
  )

  const projected12 = data.filter(d => d.projected)
  const totalProjectedSavings = projected12.reduce((s, d) => s + d.Savings, 0)
  const avgMonthlySpend = projected12.length ? projected12[0].Spending : 0
  const goalNum = Number(savingsGoal)
  const monthsToGoal = goalNum > 0 && projected12.length
    ? Math.ceil(goalNum / (projected12[0].Savings || 1))
    : null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">12-Month Projections</h1>
          <p className="page-subtitle">Based on your current spending pace</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Projected Annual Savings</div>
          <div className="stat-value" style={{ color: totalProjectedSavings >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 24 }}>
            {fmt(totalProjectedSavings)}
          </div>
          <div className="stat-sub">Next 12 months</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Monthly Spend</div>
          <div className="stat-value" style={{ fontSize: 24 }}>{fmt(avgMonthlySpend)}</div>
          <div className="stat-sub">Projected from current pace</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Savings Goal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="number"
              placeholder="Set a goal..."
              value={savingsGoal}
              onChange={e => setSavingsGoal(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', fontSize: 14 }}
              min="0"
            />
          </div>
          {monthsToGoal !== null && (
            <div className="stat-sub" style={{ marginTop: 6 }}>
              {monthsToGoal <= 12
                ? <span style={{ color: 'var(--success)' }}>✓ Achievable in ~{monthsToGoal} months</span>
                : <span style={{ color: 'var(--warning)' }}>~{monthsToGoal} months at current pace</span>
              }
            </div>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="card empty-state">
          <div style={{ fontSize: 48 }}>📈</div>
          <p style={{ fontSize: 16, color: 'var(--text)' }}>No data yet</p>
          <p>Set up your budget and log transactions to see projections.</p>
        </div>
      ) : (
        <>
          {/* Income vs Spending */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">Income vs Spending</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-accent">— Historical</span>
                <span className="badge badge-warning">-- Projected</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => fmt(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone" dataKey="Income"
                  stroke="var(--success)" strokeWidth={2}
                  dot={d => d.payload.projected ? <circle cx={d.cx} cy={d.cy} r={3} fill="var(--success)" strokeDasharray="4" /> : <circle cx={d.cx} cy={d.cy} r={4} fill="var(--success)" />}
                  strokeDasharray={d => ''}
                />
                <Line
                  type="monotone" dataKey="Spending"
                  stroke="var(--danger)" strokeWidth={2}
                />
                <Line
                  type="monotone" dataKey="Savings"
                  stroke="var(--accent)" strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative savings */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Cumulative Savings Trajectory</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }}
                  formatter={v => fmt(v)}
                />
                <Area
                  type="monotone" dataKey="Cumulative"
                  stroke="var(--accent)" fill="url(#savingsGrad)" strokeWidth={2}
                />
                {goalNum > 0 && (
                  <Line
                    type="monotone" dataKey={() => goalNum}
                    stroke="var(--warning)" strokeDasharray="6 3" strokeWidth={1.5}
                    dot={false} name={`Goal: ${fmt(goalNum)}`}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
