import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import AddressInput from './components/AddressInput'
import DecisionEngine from './components/DecisionEngine'
import ResultsDashboard from './components/ResultsDashboard'
import AgentRegister from './pages/AgentRegister'
import AgentDashboard from './pages/AgentDashboard'
import AgentLogin from './pages/AgentLogin'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const [step, setStep] = useState('landing')
  const [propertyData, setPropertyData] = useState(null)
  const [calculationResults, setCalculationResults] = useState(null)

  const path = window.location.pathname

  // Agent routes
  if (path === '/agent-login') {
    return <AgentLogin />
  }
  
  if (path === '/agent-dashboard') {
    return <AgentDashboard />
  }

  if (path === '/agent-register') {
    return <AgentRegister />
  }

if (path === '/admin-login') {
  return <AdminLogin />
}

if (path === '/admin') {
  return <AdminDashboard />
}

  // Main app routes
  const handleGetStarted = () => setStep('address')
  const handleAddressSubmit = (data) => {
    setPropertyData(data)
    setStep('engine')
  }
  const handleCalculationComplete = (results) => {
    setCalculationResults(results)
    setStep('results')
  }
  const handleReset = () => {
    setStep('landing')
    setPropertyData(null)
    setCalculationResults(null)
  }

  return (
    <div className="min-h-screen w-full">
      {step === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
      {step === 'address' && <AddressInput onSubmit={handleAddressSubmit} />}
      {step === 'engine' && (
        <DecisionEngine 
          propertyData={propertyData} 
          onComplete={handleCalculationComplete}
          onBack={() => setStep('address')}
        />
      )}
      {step === 'results' && (
        <ResultsDashboard 
          results={calculationResults} 
          propertyData={propertyData}
          onReset={handleReset}
          onNewCalculation={() => setStep('address')}
        />
      )}
    </div>
  )
}

export default App