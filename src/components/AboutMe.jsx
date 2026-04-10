import React from 'react'

export default function AboutMe({ onGetStarted, onBack }) {
  return (
    <div className="landing about-page">

      {/* ── Navbar ─────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-container landing-nav-inner">
          <button className="landing-logo" onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <div className="landing-logo-icon">💰</div>
            BudgetWise
          </button>
          <div className="landing-nav-links">
            <button onClick={onBack} className="landing-footer-link">Home</button>
            <button onClick={onBack} className="landing-footer-link" style={{ fontSize: 14, fontWeight: 500 }}>Features</button>
          </div>
          <div className="landing-nav-cta">
            <button className="landing-btn landing-btn-outline" onClick={onGetStarted} style={{ padding: '10px 20px', fontSize: 14 }}>Sign In</button>
            <button className="landing-btn landing-btn-primary" onClick={onGetStarted} style={{ padding: '10px 20px', fontSize: 14 }}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────── */}
      <section className="about-hero">
        <div className="about-hero-glow" />
        <div className="landing-container about-hero-inner">
          <div className="about-hero-text">
            <div className="landing-tag" style={{ marginBottom: 20 }}>Founder Story</div>
            <h1 className="about-h1">Hi, I'm Erika Dammeyer</h1>
            <div className="about-title-line">Founder &amp; CEO, ClearPath Finance</div>
            <p className="about-hero-p">
              I graduated in 2026 with a degree in Agribusiness Management and absolutely
              no idea what to do with my first real paycheck. Between student loans, rent,
              groceries, and trying to actually enjoy my twenties, the math never seemed
              to add up.
            </p>
            <p className="about-hero-p">
              So I built the tool I wish I'd had.
            </p>
            <div className="about-hero-actions">
              <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={onGetStarted}>
                Try BudgetWise Free →
              </button>
            </div>
          </div>
          <div className="about-hero-img-wrap">
            <img
              src="/IMG_5589.jpg"
              alt="Erika Dammeyer at a professional event"
              className="about-hero-img"
            />
            <div className="about-hero-img-badge">
              <span className="about-badge-icon">🎓</span>
              <div>
                <div className="about-badge-title">Agribusiness Management</div>
                <div className="about-badge-sub">Class of 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem ────────────────────────────── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="about-problem-grid">
            <div className="about-problem-text">
              <span className="landing-tag" style={{ marginBottom: 18, display: 'inline-block' }}>The Problem</span>
              <h2 className="about-section-h2">Nobody teaches you<br />the real stuff</h2>
              <p className="about-body-p">
                I took four years of economics, crop planning, and market analysis. Not one
                class covered what to do when rent, a car payment, and a student loan bill
                all hit the same week.
              </p>
              <p className="about-body-p">
                I tried spreadsheets. I tried the envelope method. I tried the apps that
                sync to your bank and somehow make you feel worse about buying coffee.
                None of it stuck because none of it felt like mine.
              </p>
              <p className="about-body-p">
                What I needed was something straightforward: put in what you earn, put in
                where it goes, and get an honest picture back. No finance degree required.
              </p>
            </div>
            <div className="about-problem-stats">
              {[
                { num: '78%', desc: 'of recent grads say they weren\'t prepared to manage their finances after school' },
                { num: '$37k',  desc: 'average student loan debt for the class of 2026' },
                { num: '1 in 3', desc: 'young adults live paycheck to paycheck with no budget in place' },
              ].map(s => (
                <div className="about-stat-card" key={s.num}>
                  <div className="about-stat-num">{s.num}</div>
                  <div className="about-stat-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── The Solution ───────────────────────────── */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-split">
            <div className="about-field-img-wrap">
              <img
                src="/IMG_5590 2.jpg"
                alt="Erika at a community outreach event"
                className="about-field-img"
              />
              <div className="about-field-caption">
                Community outreach event, 2025
              </div>
            </div>
            <div className="landing-split-text">
              <span className="landing-tag" style={{ marginBottom: 18, display: 'inline-block' }}>Why I Built This</span>
              <h2>Built from hands-on experience,<br />not a finance textbook</h2>
              <p>
                Agribusiness taught me that you can't manage what you can't measure.
                Farmers track every input and output down to the dollar. I started
                treating my own money the same way and it actually worked.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
                BudgetWise is not an accounting app. It's what I put together for
                people in the same spot I was: first paycheck, a few too many bills,
                and no clear picture of where anything was going. It's honest, it's
                direct, and it gets out of your way.
              </p>
              <div className="landing-checks">
                {[
                  'Made for people new to budgeting, not finance professionals',
                  'Categories based on how people actually spend, not textbook ideals',
                  'Alerts that flag problems with enough time to do something about it',
                ].map(c => (
                  <div className="landing-check-item" key={c}>
                    <CheckIcon />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-label"><span className="landing-tag">What I Believe</span></div>
          <h2 className="landing-section-title">The principles behind BudgetWise</h2>
          <div className="about-values-grid">
            {[
              {
                icon: '🌾',
                title: 'Simple over clever',
                desc: 'A budget you actually use beats a perfect one sitting in a spreadsheet. Every screen in BudgetWise is built to be obvious without a tutorial.',
              },
              {
                icon: '⚡',
                title: 'Awareness, not guilt',
                desc: 'Knowing where your money goes should feel useful, not shameful. The alerts exist to give you a heads-up, not a lecture.',
              },
              {
                icon: '🎯',
                title: 'Small wins add up',
                desc: 'You will not nail your budget in month one. That is fine. BudgetWise tracks your progress month over month so you can see yourself improving.',
              },
              {
                icon: '🔒',
                title: 'You control your data',
                desc: 'No bank link required. You log what you want, when you want. Nothing is shared, nothing is sold.',
              },
            ].map(v => (
              <div className="landing-feature-card" key={v.title}>
                <div className="landing-feature-icon">{v.icon}</div>
                <div className="landing-feature-title">{v.title}</div>
                <div className="landing-feature-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="landing-cta-glow" />
        <div className="landing-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
          <h2 className="landing-cta-h2">Ready to see where<br />your money actually goes?</h2>
          <p className="landing-cta-sub">
            If you have ever looked at your bank account and had no idea how it got that low,
            this is what I built for that feeling.
          </p>
          <button className="landing-btn landing-btn-primary landing-btn-lg" onClick={onGetStarted}>
            Start Your Free Budget →
          </button>
          <div className="landing-cta-note">No credit card required · Takes less than 5 minutes</div>
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
            <button onClick={onGetStarted} className="landing-footer-link">Get Started</button>
            <button onClick={onBack} className="landing-footer-link">Home</button>
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
