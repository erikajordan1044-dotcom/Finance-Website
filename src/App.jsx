import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import LandingPage from './components/LandingPage'
import AboutMe from './components/AboutMe'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import BudgetSetup from './components/BudgetSetup'
import TransactionLog from './components/TransactionLog'
import Projections from './components/Projections'
import AlertsPanel from './components/AlertsPanel'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [publicPage, setPublicPage] = useState('landing') // 'landing' | 'about' | 'auth'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading BudgetWise...</p>
      </div>
    )
  }

  if (!session) {
    if (publicPage === 'about') return <AboutMe onGetStarted={() => setPublicPage('auth')} onBack={() => setPublicPage('landing')} />
    if (publicPage === 'auth')  return <Auth />
    return <LandingPage onGetStarted={() => setPublicPage('auth')} onAbout={() => setPublicPage('about')} />
  }

  const pages = {
    dashboard:    <Dashboard    session={session} navigate={setCurrentPage} />,
    budget:       <BudgetSetup  session={session} navigate={setCurrentPage} />,
    transactions: <TransactionLog session={session} navigate={setCurrentPage} />,
    projections:  <Projections  session={session} navigate={setCurrentPage} />,
    alerts:       <AlertsPanel  session={session} navigate={setCurrentPage} />,
  }

  return (
    <div className="app">
      <Navbar session={session} currentPage={currentPage} navigate={setCurrentPage} />
      <main className="main-content">
        {pages[currentPage] || pages.dashboard}
      </main>
    </div>
  )
}

export default App
