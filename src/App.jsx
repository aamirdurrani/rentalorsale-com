import React, { useState } from 'react'
import LandingPage from './components/LandingPage'
import AddressInput from './components/AddressInput'
import DecisionEngine from './components/DecisionEngine'
import ResultsDashboard from './components/ResultsDashboard'
import AgentRegister from './pages/AgentRegister'


function App() {
  const [step, setStep] = useState('landing')
  const [propertyData, setPropertyData] = useState(null)
  const [calculationResults, setCalculationResults] = useState(null)

  const handleGetStarted = () => {
    console.log('Get Started clicked - moving to address step')
    setStep('address')
  }

  const handleAddressSubmit = (data) => {
    console.log('Address submitted:', data)
    setPropertyData(data)
    setStep('engine')
  }

  const handleCalculationComplete = (results) => {
    console.log('Calculation complete:', results)
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