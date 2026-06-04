import React, { useState } from 'react'
import WealthChart from './WealthChart'
import LeadCapture from './LeadCapture'
import AgentMatch from './AgentMatch'

// Helper function to extract zip code from address
const extractZipFromAddress = (address) => {
    if (!address) return null
    const match = address.match(/\b\d{5}(?:-\d{4})?\b/)
    return match ? match[0] : null
}

function ResultsDashboard({ results, propertyData, onReset, onNewCalculation }) {
  const [showLeadCapture, setShowLeadCapture] = useState(false)

  // Add safety check - if results is null or undefined, show error
  if (!results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="card text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">No results found. Please go back and try again.</p>
          <button onClick={onReset} className="btn-primary mt-6">Start Over</button>
        </div>
      </div>
    )
  }

  // Get zip code from propertyData or extract from address
  const zipCode = propertyData?.zipCode || extractZipFromAddress(propertyData?.address)

  const formatCurrency = (value) => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
      return '$0'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(value))
  }

  const getRecommendationColor = () => {
    return results.betterOption === 'rent' ? 'text-blue-600' : 'text-green-600'
  }

  const getRecommendationIcon = () => {
    return results.betterOption === 'rent' ? '🏠' : '💰'
  }

  const wealthDiff = results.wealthDifference || 0
  const rentWealth = results.rentWealth || 0
  const sellWealth = results.sellWealth || 0
  const sellProceeds = results.sellProceeds || 0
  const sellingCosts = results.sellingCosts || 0
  const mortgagePayoff = results.mortgagePayoff || 0
  const totalRentalIncome = results.totalRentalIncome || 0
  const totalExpenses = results.totalExpenses || 0
  const appreciationGain = results.appreciationGain || 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Decision Analysis</h1>
        <p className="text-gray-600">{propertyData?.address || 'Your property'}</p>
        {zipCode && <p className="text-xs text-gray-400 mt-1">ZIP: {zipCode}</p>}
      </div>

      {/* Main Recommendation Card */}
      <div className="card text-center mb-8 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="text-6xl mb-4">{getRecommendationIcon()}</div>
        <h2 className="text-3xl font-bold mb-4">
          <span className={getRecommendationColor()}>
            {results.betterOption === 'rent' ? 'RENT IT OUT' : 'SELL NOW'}
          </span>
        </h2>
        
        <p className="text-xl mb-4">
          You'd have{' '}
          <span className="font-bold text-2xl text-blue-600">
            {formatCurrency(wealthDiff)}
          </span>
          {' '}more wealth by choosing to {results.betterOption}
        </p>
        
        {results.breakevenYear && (
          <p className="text-gray-700">
            Break-even point: {results.breakevenYear} years
          </p>
        )}
        
        <div className="mt-6 p-4 bg-white rounded-xl inline-block mx-auto">
          <p className="text-gray-700 max-w-md">
            {results.recommendation || 
              `Based on your inputs, ${results.betterOption === 'rent' ? 'renting your property' : 'selling now'} 
              would maximize your wealth.`}
          </p>
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🏠</span> Rent Strategy
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Wealth:</span>
              <span className="font-semibold text-blue-600 text-lg">{formatCurrency(rentWealth)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500">Show details</summary>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Rental Income:</span>
                    <span>{formatCurrency(totalRentalIncome)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operating Expenses:</span>
                    <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Appreciation Gain:</span>
                    <span className="text-green-600">+{formatCurrency(appreciationGain)}</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>💰</span> Sell Strategy
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Net Proceeds:</span>
              <span className="font-semibold text-green-600 text-lg">{formatCurrency(sellWealth)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-500">Show details</summary>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span>Sale Proceeds:</span>
                    <span>{formatCurrency(sellProceeds)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Selling Costs (8%):</span>
                    <span className="text-red-600">-{formatCurrency(sellingCosts)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mortgage Payoff:</span>
                    <span className="text-red-600">-{formatCurrency(mortgagePayoff)}</span>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action - Lead Capture */}
      {!showLeadCapture ? (
        <div className="card text-center bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-2xl font-bold mb-3">Want the Full Report?</h3>
          <p className="text-gray-700 mb-6">
            Get a detailed 15-page PDF with market comparables, tax analysis, and personalized recommendations.
          </p>
          <button 
            onClick={() => setShowLeadCapture(true)}
            className="btn-primary"
          >
            Send Me the Free Report →
          </button>
        </div>
      ) : (
        <LeadCapture 
          propertyData={propertyData}
          results={results}
          onComplete={() => setShowLeadCapture(false)}
        />
      )}

      {/* Agent Match Section - Shows if we have a zip code */}
      {zipCode && (
        <div className="mt-8">
          <AgentMatch 
            zipCode={zipCode}
            propertyValue={results?.sellWealth || results?.rentWealth}
            recommendation={results?.betterOption}
          />
        </div>
      )}

      {/* Debug: Show if zipCode is missing (remove later) */}
      {!zipCode && (
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-center text-sm text-yellow-700">
          ⚠️ No zip code found for this property. Agent matching requires a zip code.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button onClick={onNewCalculation} className="btn-secondary flex-1">
          ← New Calculation
        </button>
        <button onClick={onReset} className="btn-secondary flex-1">
          Start Over
        </button>
      </div>
    </div>
  )
}

export default ResultsDashboard