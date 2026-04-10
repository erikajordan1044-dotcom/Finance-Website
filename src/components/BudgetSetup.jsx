import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { fmt } from '../utils'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

const DEFAULT_CATEGORIES = [
  { name: 'Housing',        color: '#C9A84C', budgeted_amount: '' },
  { name: 'Food & Dining',  color: '#22c55e', budgeted_amount: '' },
  { name: 'Transportation', color: '#f59e0b', budgeted_amount: '' },
  { name: 'Entertainment',  color: '#ec4899', budgeted_amount: '' },
  { name: 'Health',         color: '#14b8a6', budgeted_amount: '' },
  { name: 'Shopping',       color: '#f97316', budgeted_amount: '' },
  { name: 'Savings',        color: '#8b5cf6', budgeted_amount: '' },
  { name: 'Other',          color: '#94a3b8', budgeted_amount: '' },
]

const COLORS = ['#C9A84C','#22c55e','#f59e0b','#ec4899','#14b8a6','#f97316','#8b5cf6','#ef4444','#94a3b8','#0ea5e9']

export default function BudgetSetup({ session, navigate }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [income, setIncome]     = useState('')
  const [cats,   setCats]       = useState(DEFAULT_CATEGORIES)
  const [budgetId, setBudgetId] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => { load() }, [month, year])

  const load = async () => {
    setLoading(true); setSaved(false)
    const uid = session.user.id
    const { data: bud } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', uid).eq('month', month).eq('year', year)
      .single()

    if (bud) {
      setBudgetId(bud.id)
      setIncome(String(bud.income))
      const { data: dbCats } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', bud.id)
      setCats(dbCats?.length ? dbCats.map(c => ({ ...c, budgeted_amount: String(c.budgeted_amount) })) : DEFAULT_CATEGORIES)
    } else {
      setBudgetId(null)
      setIncome('')
      setCats(DEFAULT_CATEGORIES)
    }
    setLoading(false)
  }

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  const updateCat = (i, field, val) => {
    setCats(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c))
  }

  const addCat = () => {
    setCats(prev => [...prev, {
      name: '',
      budgeted_amount: '',
      color: COLORS[prev.length % COLORS.length],
    }])
  }

  const removeCat = (i) => {
    setCats(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    if (!income || Number(income) <= 0) return alert('Please enter a valid income.')
    setSaving(true)
    const uid = session.user.id

    try {
      // Upsert budget
      let bid = budgetId
      if (!bid) {
        const { data, error } = await supabase
          .from('budgets')
          .insert({ user_id: uid, month, year, income: Number(income) })
          .select()
          .single()
        if (error) throw error
        bid = data.id
        setBudgetId(bid)
      } else {
        await supabase.from('budgets').update({ income: Number(income) }).eq('id', bid)
      }

      // Delete old categories, re-insert
      await supabase.from('budget_categories').delete().eq('budget_id', bid)

      const validCats = cats.filter(c => c.name.trim() && Number(c.budgeted_amount) >= 0)
      if (validCats.length > 0) {
        await supabase.from('budget_categories').insert(
          validCats.map(c => ({
            budget_id: bid,
            user_id: uid,
            name: c.name.trim(),
            budgeted_amount: Number(c.budgeted_amount) || 0,
            color: c.color,
          }))
        )
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Error saving budget: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalBudgeted = cats.reduce((s, c) => s + (Number(c.budgeted_amount) || 0), 0)
  const incomeNum = Number(income) || 0
  const unallocated = incomeNum - totalBudgeted

  if (loading) return (
    <div className="loading-screen" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="loading-spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget Setup</h1>
          <p className="page-subtitle">Set your income and category budgets for the month</p>
        </div>
        <div className="month-nav">
          <button onClick={() => changeMonth(-1)}>‹</button>
          <span className="month-label">{MONTHS[month-1]} {year}</span>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>
      </div>

      {/* Income */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>💵 Monthly Income</div>
        <div style={{ maxWidth: 320 }}>
          <label className="form-label">Gross Monthly Income</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
            <input
              type="number"
              placeholder="0.00"
              value={income}
              onChange={e => setIncome(e.target.value)}
              style={{ paddingLeft: 28 }}
              min="0"
              step="0.01"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">📂 Spending Categories</span>
          <button className="btn btn-secondary btn-sm" onClick={addCat}>+ Add Category</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cats.map((cat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={cat.color || '#C9A84C'}
                onChange={e => updateCat(i, 'color', e.target.value)}
                style={{ width: 36, height: 36, padding: 2, border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="text"
                placeholder="Category name"
                value={cat.name}
                onChange={e => updateCat(i, 'name', e.target.value)}
                style={{ flex: 1 }}
              />
              <div style={{ position: 'relative', width: 160, flexShrink: 0 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={cat.budgeted_amount}
                  onChange={e => updateCat(i, 'budgeted_amount', e.target.value)}
                  style={{ paddingLeft: 24 }}
                  min="0"
                  step="0.01"
                />
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeCat(i)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>Summary</div>
        <div className="grid-3">
          <div>
            <div className="stat-label">Total Income</div>
            <div className="stat-value" style={{ fontSize: 22, color: 'var(--success)' }}>{fmt(incomeNum)}</div>
          </div>
          <div>
            <div className="stat-label">Total Budgeted</div>
            <div className="stat-value" style={{ fontSize: 22 }}>{fmt(totalBudgeted)}</div>
          </div>
          <div>
            <div className="stat-label">Unallocated</div>
            <div className="stat-value" style={{ fontSize: 22, color: unallocated < 0 ? 'var(--danger)' : 'var(--success)' }}>
              {fmt(unallocated)}
            </div>
            {unallocated < 0 && (
              <div className="stat-sub" style={{ color: 'var(--danger)' }}>⚠️ Budgeted more than income</div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Budget'}
        </button>
        {saved && <span className="badge badge-success" style={{ alignSelf: 'center' }}>✓ Saved!</span>}
        <button className="btn btn-secondary" onClick={() => navigate('dashboard')}>
          View Dashboard
        </button>
      </div>
    </div>
  )
}
