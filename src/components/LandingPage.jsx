import React from 'react'

export default function LandingPage({ onGetStarted, onAbout }) {
  return (
    <div className="landing">

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <a href="#" className="landing-logo">
            <div className="landing-logo-icon">💰</div>
            BudgetWise
          </a>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Reviews</a>
            <button onClick={onAbout} className="landing-footer-link" style={{ fontSize: 14, fontWeight: 500 }}>About</button>
          </div>
          <div className="landing-nav-cta">
            <button className="landing-btn landing-btn-outline" onClick={onGetStarted}>Sign In</button>
            <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-container landing-hero-inner">
          <div className="landing-tag">Personal Finance, Simplified</div>
          <h1 className="landing-hero-h1">
            Stop wondering where<br />your money went.
          </h1>
          <p className="landing-hero-sub">
            BudgetWise shows you exactly where your money is going, warns you before
            a category blows up, and maps out your next 12 months.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={onGetStarted}>
              Start for Free →
            </button>
            <a href="#features" className="landing-btn landing-btn-outline landing-btn-lg">
              See the Features
            </a>
          </div>

          {/* Dashboard preview */}
          <div className="landing-preview">
            <div className="landing-preview-bar">
              <div className="lpb-dot" style={{ background: '#ef4444' }} />
              <div className="lpb-dot" style={{ background: '#f59e0b' }} />
              <div className="lpb-dot" style={{ background: '#22c55e' }} />
              <div className="lpb-url">app.budgetwise.io/dashboard</div>
            </div>
            <div className="landing-preview-screen">
              <div className="lp-fake-nav">
                <div className="lp-fake-logo">💰 BudgetWise</div>
                <div className="lp-fake-tabs">
                  <div className="lp-fake-tab lp-active">Dashboard</div>
                  <div className="lp-fake-tab">Budget</div>
                  <div className="lp-fake-tab">Transactions</div>
                  <div className="lp-fake-tab">Projections</div>
                  <div className="lp-fake-tab">Alerts</div>
                </div>
              </div>
              <div className="lp-stats-row">
                {[
                  { label: 'Monthly Income',  value: '$5,400', color: '#22c55e', sub: 'Gross monthly' },
                  { label: 'Total Budgeted',  value: '$4,200', color: null,      sub: '6 categories' },
                  { label: 'Spent So Far',    value: '$2,810', color: '#f59e0b', sub: 'Day 18 of 30' },
                  { label: 'Remaining',       value: '$2,590', color: '#22c55e', sub: 'On track' },
                ].map(s => (
                  <div className="lp-stat" key={s.label}>
                    <div className="lp-stat-label">{s.label}</div>
                    <div className="lp-stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
                    <div className="lp-stat-sub">{s.sub}</div>
                  </div>
                ))}
              </div>
              <div className="lp-charts-row">
                <div className="lp-card">
                  <div className="lp-card-title">Category Progress</div>
                  {[
                    { name: 'Housing',       pct: 100, spent: '$1,200', budget: '$1,200', color: '#C9A84C' },
                    { name: 'Food',          pct: 80,  spent: '$480',   budget: '$600',   color: '#f59e0b' },
                    { name: 'Transport',     pct: 40,  spent: '$120',   budget: '$300',   color: '#22c55e' },
                    { name: 'Entertainment', pct: 100, spent: '$310 ⚠️', budget: '$250',  color: '#ef4444', over: true },
                  ].map(cat => (
                    <div className="lp-bar-row" key={cat.name}>
                      <div className="lp-bar-labels">
                        <span>{cat.name}</span>
                        <span style={cat.over ? { color: '#ef4444' } : {}}>{cat.spent} / {cat.budget}</span>
                      </div>
                      <div className="lp-bar-track">
                        <div className="lp-bar-fill" style={{ width: `${cat.pct}%`, background: cat.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="lp-card">
                  <div className="lp-card-title">Spending Breakdown</div>
                  <div className="lp-pie-area">
                    <div className="lp-pie" />
                    <div className="lp-legend">
                      {[
                        { color: '#C9A84C', label: 'Housing 43%' },
                        { color: '#22c55e', label: 'Food 24%' },
                        { color: '#f59e0b', label: 'Transport 20%' },
                        { color: '#ef4444', label: 'Other 13%' },
                      ].map(l => (
                        <div className="lp-legend-item" key={l.label}>
                          <div className="lp-legend-dot" style={{ background: l.color }} />
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────── */}
      <div className="landing-stats-strip">
        <div className="landing-container landing-stats-grid">
          {[
            { num: '$12k+',     desc: 'Average annual savings unlocked' },
            { num: '6',         desc: 'Powerful budget tracking features' },
            { num: '12mo',      desc: 'Financial projection horizon' },
            { num: 'Real-time', desc: 'Spending alerts & notifications' },
          ].map(s => (
            <div className="landing-stat-item" key={s.num}>
              <div className="landing-stat-num">{s.num}</div>
              <div className="landing-stat-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────── */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="landing-section-label"><span className="landing-tag">Everything You Need</span></div>
          <h2 className="landing-section-title">Built for people who<br />actually want to save money</h2>
          <p className="landing-section-sub">Log a transaction, see where you stand. No spreadsheets, no syncing your bank, no 30-minute setup.</p>
          <div className="landing-features-grid">
            {[
              { icon: '📋', title: 'Budget Setup',             desc: 'Define your monthly income and carve it into spending categories with custom colors and limits for each.' },
              { icon: '🧾', title: 'Transaction Log',          desc: 'Log expenses and income in a few taps. Filter, search, and edit entries any time.' },
              { icon: '📊', title: 'Visual Dashboard',         desc: 'Bar charts, donut charts, and progress bars show you the full picture. Flip between months with one click.' },
              { icon: '🔮', title: '12-Month Projections',     desc: 'See where your finances are headed. Extrapolate your current patterns to show your projected balance a full year out.' },
              { icon: '🔔', title: 'Smart Alerts',             desc: 'Get notified before you overspend. BudgetWise watches your daily pace and fires an alert the moment a category trends over.' },
              { icon: '🎯', title: 'Savings Goal Tracking',    desc: 'Set a savings target and watch your progress grow. Always know exactly how close you are to hitting your goal.' },
            ].map(f => (
              <div className="landing-feature-card" key={f.title}>
                <div className="landing-feature-icon">{f.icon}</div>
                <div className="landing-feature-title">{f.title}</div>
                <div className="landing-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section className="landing-section landing-section-alt" id="how-it-works">
        <div className="landing-container">
          <div className="landing-section-label"><span className="landing-tag">How It Works</span></div>
          <h2 className="landing-section-title">Up and running in 3 steps</h2>
          <p className="landing-section-sub">No bank sync, no credit card required to start. Just your numbers.</p>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">1</div>
              <div className="landing-step-title">Create Your Budget</div>
              <div className="landing-step-desc">Enter your monthly income and set spending limits for each category — rent, groceries, subscriptions, whatever matters to you.</div>
            </div>
            <div className="landing-step">
              <div className="landing-step-num">2</div>
              <div className="landing-step-title">Log Your Transactions</div>
              <div className="landing-step-desc">Add expenses and income as they happen. Assign a category in seconds and watch your budget bars update in real time.</div>
            </div>
            <div className="landing-step">
              <div className="landing-step-num">3</div>
              <div className="landing-step-title">Let BudgetWise Guide You</div>
              <div className="landing-step-desc">Get visual feedback, smart alerts when you're going over, and a 12-month projection so the future is never a surprise.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Alerts Callout ─────────────────────────── */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-split">
            <div className="landing-split-text">
              <span className="landing-tag" style={{ marginBottom: 18, display: 'inline-block' }}>Smart Alerts</span>
              <h2>Stop overspending<br />before it happens</h2>
              <p>Most people only realize they're over budget when the month is already done. BudgetWise monitors your spending pace daily and warns you <em>while there's still time to course-correct.</em></p>
              <div className="landing-checks">
                {[
                  'Pace alerts when daily spending trends over budget',
                  'Over-limit warnings the moment a category exceeds its cap',
                  'Positive alerts when you\'re comfortably under and saving well',
                ].map(c => (
                  <div className="landing-check-item" key={c}>
                    <CheckIcon />
                    {c}
                  </div>
                ))}
              </div>
              <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>See It in Action →</button>
            </div>
            <div className="landing-alert-demo">
              {[
                { level: 'danger', emoji: '🚨', title: 'Entertainment — Over Budget',  desc: "You've spent $310 of your $250 limit this month." },
                { level: 'warn',   emoji: '⚡', title: 'Food — Spending Fast',          desc: "At your current pace you'll hit $780 by month-end — $180 over your $600 budget." },
                { level: 'warn',   emoji: '⚠️', title: 'Transport — 80% Used',         desc: '$240 of $300 spent with 12 days remaining.' },
                { level: 'good',   emoji: '✅', title: 'Housing — Right on Track',     desc: "You're pacing perfectly on your $1,200 housing budget." },
              ].map(a => (
                <div className={`landing-alert-item landing-alert-${a.level}`} key={a.title}>
                  <div className="landing-alert-emoji">{a.emoji}</div>
                  <div>
                    <div className="landing-alert-title">{a.title}</div>
                    <div className="landing-alert-desc">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Projections Callout ─────────────────────── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-split landing-split-reverse">
            <div className="landing-proj-chart">
              <div className="landing-proj-label">12-Month Financial Projection</div>
              <div className="landing-proj-bars">
                {[
                  { month: 'Jan', h: 60,  past: true },
                  { month: 'Feb', h: 75,  past: true },
                  { month: 'Mar', h: 55,  past: true },
                  { month: 'Apr', h: 80,  past: true },
                  { month: 'May', h: 45,  past: true, today: true },
                  { month: 'Jun', h: 65,  past: false },
                  { month: 'Jul', h: 70,  past: false },
                  { month: 'Aug', h: 60,  past: false },
                  { month: 'Sep', h: 78,  past: false },
                  { month: 'Oct', h: 85,  past: false },
                  { month: 'Nov', h: 90,  past: false },
                  { month: 'Dec', h: 95,  past: false },
                ].map(b => (
                  <div className="landing-proj-bar-wrap" key={b.month} style={b.today ? { position: 'relative' } : {}}>
                    {b.today && <div className="landing-proj-today">TODAY</div>}
                    <div
                      className={`landing-proj-bar ${b.past ? 'lpb-past' : 'lpb-proj'}`}
                      style={{ height: `${b.h}%` }}
                    />
                    <div className="landing-proj-month">{b.month}</div>
                  </div>
                ))}
              </div>
              <div className="landing-proj-legend">
                <div className="landing-proj-legend-item">
                  <div className="landing-proj-swatch" style={{ background: '#C9A84C' }} />
                  Actual
                </div>
                <div className="landing-proj-legend-item">
                  <div className="landing-proj-swatch" style={{ background: 'rgba(99,102,241,.4)', border: '1px dashed rgba(99,102,241,.6)' }} />
                  Projected
                </div>
              </div>
            </div>
            <div className="landing-split-text">
              <span className="landing-tag" style={{ marginBottom: 18, display: 'inline-block' }}>12-Month Projections</span>
              <h2>See your financial future, today</h2>
              <p>BudgetWise takes your actual spending patterns and projects them forward a full year — so you can spot a problem in July before it's actually July.</p>
              <div className="landing-checks">
                {[
                  'Based on your real monthly averages — not estimates',
                  'Projects income, expenses, and net savings month by month',
                  'Recalculates automatically as you log new transactions',
                ].map(c => (
                  <div className="landing-check-item" key={c}>
                    <CheckIcon />
                    {c}
                  </div>
                ))}
              </div>
              <button className="landing-btn landing-btn-primary" onClick={onGetStarted}>Try It Now →</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────── */}
      <section className="landing-section" id="testimonials">
        <div className="landing-container">
          <div className="landing-section-label"><span className="landing-tag">Real Results</span></div>
          <h2 className="landing-section-title">People who actually use it</h2>
          <p className="landing-section-sub">BudgetWise users report catching overspending habits within the first two weeks.</p>
          <div className="landing-testimonials-grid">
            {[
              {
                initials: 'JM', color: 'linear-gradient(135deg,#C9A84C,#DDB96A)',
                name: 'Jamie M.', role: 'Software Engineer',
                quote: '"I\'ve tried every budgeting app out there. BudgetWise is the first one where I actually understood where my money was going within the first week. The alerts are a game changer."',
              },
              {
                initials: 'SR', color: 'linear-gradient(135deg,#22c55e,#4ade80)',
                name: 'Sarah R.', role: 'Marketing Manager',
                quote: '"The 12-month projection feature helped me realize I was on track to be $3,000 short for my vacation fund. I adjusted in February and hit my goal right on time."',
              },
              {
                initials: 'DK', color: 'linear-gradient(135deg,#f59e0b,#fcd34d)',
                name: 'David K.', role: 'Freelance Designer',
                quote: '"The dashboard is beautiful and actually makes me want to check my finances. I log every transaction now — something I never did with spreadsheets or other apps."',
              },
            ].map(t => (
              <div className="landing-testimonial-card" key={t.name}>
                <div className="landing-stars">★★★★★</div>
                <div className="landing-testimonial-text">{t.quote}</div>
                <div className="landing-testimonial-author">
                  <div className="landing-avatar" style={{ background: t.color }}>{t.initials}</div>
                  <div>
                    <div className="landing-author-name">{t.name}</div>
                    <div className="landing-author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="landing-cta-glow" />
        <div className="landing-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 className="landing-cta-h2">Your money deserves<br />a better plan.</h2>
          <p className="landing-cta-sub">Join the people who stopped guessing and started knowing. It takes less than 5 minutes to set up your first budget.</p>
          <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={onGetStarted}>
            Create Your Free Account →
          </button>
          <div className="landing-cta-note">No credit card required · Set up in under 5 minutes</div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-logo">
            <div className="landing-footer-logo-icon">💰</div>
            BudgetWise
          </div>
          <div className="landing-footer-copy">© 2026 BudgetWise. All rights reserved.</div>
          <div className="landing-footer-links">
            <button onClick={onGetStarted} className="landing-footer-link">App</button>
            <a href="#features" className="landing-footer-link">Features</a>
            <a href="#how-it-works" className="landing-footer-link">How It Works</a>
          </div>
        </div>
      </footer>

    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
      <circle cx="9" cy="9" r="9" fill="rgba(99,102,241,.2)" />
      <path d="M5 9.5l3 3 5-5" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
