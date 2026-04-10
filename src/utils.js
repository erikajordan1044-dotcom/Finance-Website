// ── Currency formatting ───────────────────────────
export function fmt(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)
}

// ── Date helpers ──────────────────────────────────
export function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

export function getDaysElapsed(month, year) {
  const now = new Date()
  // If viewing current month, return today's day; else return full month
  if (now.getFullYear() === year && now.getMonth() + 1 === month) {
    return now.getDate()
  }
  const end = new Date(year, month, 0)
  return end < now ? getDaysInMonth(month, year) : 0
}

// ── Smart alert engine ────────────────────────────
/**
 * Returns an array of alert objects:
 * { level: 'danger'|'warning'|'success', icon, title, desc, actionLabel?, actionPage? }
 */
export function getAlerts(budget, categories, transactions, month, year) {
  const alerts = []
  const income = Number(budget.income)
  const daysElapsed = getDaysElapsed(month, year)
  const daysInMonth = getDaysInMonth(month, year)

  const expenses = transactions.filter(t => t.type === 'expense')
  const totalSpent = expenses.reduce((s, t) => s + Number(t.amount), 0)
  const totalBudgeted = categories.reduce((s, c) => s + Number(c.budgeted_amount), 0)

  // Spending per category
  const spentByCat = {}
  expenses.forEach(t => {
    if (t.category_id) spentByCat[t.category_id] = (spentByCat[t.category_id] || 0) + Number(t.amount)
  })

  // 1. Overall over budget
  if (totalSpent > income) {
    alerts.push({
      level: 'danger',
      icon: '🚨',
      title: 'Over Budget!',
      desc: `You've spent ${fmt(totalSpent)} — ${fmt(totalSpent - income)} over your ${fmt(income)} monthly income.`,
      actionLabel: 'View Transactions',
      actionPage: 'transactions',
    })
  }

  // 2. Projected overspend
  if (daysElapsed > 3 && daysElapsed < daysInMonth) {
    const dailyRate = totalSpent / daysElapsed
    const projected = dailyRate * daysInMonth
    if (projected > income) {
      alerts.push({
        level: 'danger',
        icon: '📉',
        title: 'On Track to Overspend',
        desc: `At your current pace you'll spend ${fmt(projected)} this month — ${fmt(projected - income)} over your income.`,
        actionLabel: 'Fix Budget',
        actionPage: 'budget',
      })
    } else if (projected > totalBudgeted * 0.95) {
      alerts.push({
        level: 'warning',
        icon: '⚠️',
        title: 'Approaching Budget Limit',
        desc: `Projected month-end spending: ${fmt(projected)} (budget: ${fmt(totalBudgeted)}).`,
      })
    }
  }

  // 3. Per-category alerts
  categories.forEach(cat => {
    const spent    = spentByCat[cat.id] || 0
    const budgeted = Number(cat.budgeted_amount)
    if (budgeted === 0) return

    const pct = spent / budgeted
    if (pct > 1) {
      alerts.push({
        level: 'danger',
        icon: '💸',
        title: `${cat.name} Over Budget`,
        desc: `Spent ${fmt(spent)} — ${fmt(spent - budgeted)} over the ${fmt(budgeted)} budget.`,
      })
    } else if (pct > 0.85) {
      alerts.push({
        level: 'warning',
        icon: '🔶',
        title: `${cat.name} at ${Math.round(pct * 100)}%`,
        desc: `Only ${fmt(budgeted - spent)} remaining in your ${cat.name} budget.`,
      })
    }
  })

  // 4. Underspending (positive alert)
  if (daysElapsed >= 7) {
    const dayFraction = daysElapsed / daysInMonth
    const expectedSpend = totalBudgeted * dayFraction
    if (totalSpent < expectedSpend * 0.7 && totalSpent > 0) {
      alerts.push({
        level: 'success',
        icon: '🎉',
        title: 'You\'re Underspending!',
        desc: `Only spent ${fmt(totalSpent)} vs expected ${fmt(expectedSpend)} at this point. Great job!`,
      })
    }
  }

  // 5. Unallocated budget reminder
  if (income - totalBudgeted > income * 0.2 && totalBudgeted > 0) {
    alerts.push({
      level: 'warning',
      icon: '💡',
      title: 'Large Unallocated Amount',
      desc: `${fmt(income - totalBudgeted)} of your income isn't assigned to a category. Consider adding a Savings category.`,
      actionLabel: 'Edit Budget',
      actionPage: 'budget',
    })
  }

  // 6. No categories set
  if (categories.length === 0) {
    alerts.push({
      level: 'warning',
      icon: '📝',
      title: 'No Budget Categories',
      desc: 'Set up your spending categories to get detailed tracking and alerts.',
      actionLabel: 'Set Up Budget',
      actionPage: 'budget',
    })
  }

  // 7. On track overall
  if (alerts.length === 0 || (alerts.every(a => a.level === 'success'))) {
    if (totalSpent > 0) {
      alerts.push({
        level: 'success',
        icon: '✅',
        title: 'Budget on Track',
        desc: `Spent ${fmt(totalSpent)} of ${fmt(totalBudgeted)} budget (${Math.round((totalSpent/totalBudgeted)*100)}%). Keep it up!`,
      })
    }
  }

  return alerts
}
