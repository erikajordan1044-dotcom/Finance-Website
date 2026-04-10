import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { fmt } from '../utils'

const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']

export default function TransactionLog({ session, navigate }) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())
  const [transactions, setTransactions] = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [deleting, setDeleting] = useState(null)

  // Form state
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    date: now.toISOString().slice(0, 10),
    type: 'expense',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [month, year])

  const load = async () => {
    setLoading(true)
    const uid = session.user.id

    const start = `${year}-${String(month).padStart(2,'0')}-01`
    const end   = `${year}-${String(month).padStart(2,'0')}-31`

    const [{ data: txns }, { data: bud }] = await Promise.all([
      supabase.from('transactions')
        .select('*')
        .eq('user_id', uid)
        .gte('date', start).lte('date', end)
        .order('date', { ascending: false }),
      supabase.from('budgets')
        .select('id')
        .eq('user_id', uid).eq('month', month).eq('year', year)
        .single()
    ])

    setTransactions(txns || [])

    if (bud) {
      const { data: cats } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('budget_id', bud.id)
      setCategories(cats || [])
    } else {
      setCategories([])
    }

    setLoading(false)
  }

  const changeMonth = (dir) => {
    let m = month + dir, y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1)  { m = 12; y-- }
    setMonth(m); setYear(y)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return alert('Enter a valid amount.')
    setSaving(true)
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id:     session.user.id,
        description: form.description,
        amount:      Number(form.amount),
        category_id: form.category_id || null,
        date:        form.date,
        type:        form.type,
      })
      if (error) throw error
      setForm({ description: '', amount: '', category_id: '', date: now.toISOString().slice(0, 10), type: 'expense' })
      setShowForm(false)
      await load()
    } catch (err) {
      alert('Error adding transaction: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    setDeleting(id)
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
    setDeleting(null)
  }

  const filtered = filterCat
    ? transactions.filter(t => t.category_id === filterCat)
    : transactions

  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)

  if (loading) return (
    <div className="loading-screen" style={{ height: 'calc(100vh - 60px)' }}>
      <div className="loading-spinner" />
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Log your income and expenses</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="month-nav">
            <button onClick={() => changeMonth(-1)}>‹</button>
            <span className="month-label">{MONTHS[month-1]} {year}</span>
            <button onClick={() => changeMonth(1)}>›</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Expenses</div>
          <div className="stat-value" style={{ color: 'var(--danger)', fontSize: 22 }}>{fmt(totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Income Logged</div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: 22 }}>{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value" style={{ fontSize: 22 }}>{transactions.length}</div>
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h3>Add Transaction</h3>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Grocery run"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    min="0" step="0.01" required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    required
                  />
                </div>
              </div>
              {form.type === 'expense' && categories.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
                    <option value="">— Uncategorized —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {categories.length === 0 && (
                <div className="alert-item warning" style={{ marginBottom: 16 }}>
                  <span className="alert-icon">⚠️</span>
                  <div>
                    <div className="alert-title">No budget set for this month</div>
                    <div className="alert-desc">Set up your budget first to categorize transactions.</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Transaction'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${filterCat === '' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterCat('')}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`btn btn-sm ${filterCat === c.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterCat(filterCat === c.id ? '' : c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span className="color-dot" style={{ background: c.color }} />
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40 }}>💳</div>
            <p style={{ color: 'var(--text)', marginTop: 8 }}>No transactions yet</p>
            <p>Click "+ Add" to log your first transaction.</p>
            {categories.length === 0 && (
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={() => navigate('budget')}>
                Set Up Budget First
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const cat = categories.find(c => c.id === t.category_id)
                  return (
                    <tr key={t.id}>
                      <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.date}</td>
                      <td>{t.description || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      <td>
                        {cat ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="color-dot" style={{ background: cat.color }} />
                            {cat.name}
                          </span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>Uncategorized</span>}
                      </td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: t.type === 'income' ? 'var(--success)' : 'var(--text)' }}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(t.id)}
                          disabled={deleting === t.id}
                        >
                          {deleting === t.id ? '…' : '✕'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
