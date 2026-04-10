import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email for a confirmation link!')
        setEmail('')
        setPassword('')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">💰 BudgetWise</div>
      <p className="auth-tagline">Smart budgeting for smarter money decisions</p>

      <div className="auth-card">
        <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>

        {error && (
          <div className="alert-item danger" style={{ marginBottom: 16 }}>
            <span className="alert-icon">⚠️</span>
            <div><div className="alert-title">{error}</div></div>
          </div>
        )}
        {message && (
          <div className="alert-item success" style={{ marginBottom: 16 }}>
            <span className="alert-icon">✅</span>
            <div><div className="alert-title">{message}</div></div>
          </div>
        )}

        <form onSubmit={handleAuth}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ marginTop: 8 }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ marginTop: 16 }}
          >
            {isLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  )
}
