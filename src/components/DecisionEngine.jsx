import React, { useState } from 'react'
import WealthChart from './WealthChart'
import { calculateRentVsSell } from '../services/calculationEngine'

function DecisionEngine({ propertyData, onComplete, onBack }) {
  // SAFE INITIALIZATION with fixed limits
  const initialHomeValue = Math.min(Math.max(propertyData?.estimatedValue || 400000, 100000), 2000000)
  
  const [inputs, setInputs] = useState({
    homeValue: initialHomeValue,
    mortgageBalance: Math.min(initialHomeValue * 0.6, initialHomeValue),
    monthlyRent: Math.min(Math.round(initialHomeValue * 0.005), 50000),
    monthlyMortgagePayment: Math.min(Math.round(initialHomeValue * 0.004), 50000),
    holdingPeriod: 5,
    appreciationRate: 0.03,
    investmentReturnRate: 0.07,
    annualMaintenancePercent: 0.01,
    vacancyRate: 0.05,
    sellingCostPercent: 0.08
  })

  const [isCalculating, setIsCalculating] = useState(false)

  const handleSliderChange = (field, value) => {
    let parsedValue = parseFloat(value)
    
    // Apply field-specific limits
    switch(field) {
      case 'homeValue':
        parsedValue = Math.min(Math.max(parsedValue, 50000), 2000000)
        break
      case 'mortgageBalance':
        parsedValue = Math.min(Math.max(parsedValue, 0), inputs.homeValue)
        break
      case 'monthlyRent':
        parsedValue = Math.min(Math.max(parsedValue, 100), 100000)
        break
      case 'monthlyMortgagePayment':
        parsedValue = Math.min(Math.max(parsedValue, 0), 50000)
        break
      case 'holdingPeriod':
        parsedValue = Math.min(Math.max(parsedValue, 1), 30)
        break
      case 'appreciationRate':
        parsedValue = Math.min(Math.max(parsedValue, 0), 0.15)
        break
      default:
        break
    }
    
    setInputs(prev => ({ ...prev, [field]: parsedValue }))
  }

  const handleCalculate = () => {
    setIsCalculating(true)
    
    // Create safe inputs with all required fields
    const safeInputs = {
      homeValue: Math.min(Math.max(Number(inputs.homeValue) || 400000, 50000), 2000000),
      mortgageBalance: Math.min(Math.max(Number(inputs.mortgageBalance) || 0, 0), inputs.homeValue),
      monthlyRent: Math.min(Math.max(Number(inputs.monthlyRent) || 1000, 100), 100000),
      monthlyMortgagePayment: Math.min(Math.max(Number(inputs.monthlyMortgagePayment) || 1500, 0), 50000),
      holdingPeriod: Math.min(Math.max(Number(inputs.holdingPeriod) || 5, 1), 30),
      appreciationRate: Math.min(Math.max(Number(inputs.appreciationRate) || 0.03, 0), 0.15),
      investmentReturnRate: Math.min(Math.max(Number(inputs.investmentReturnRate) || 0.07, 0), 0.15),
      annualMaintenancePercent: Math.min(Math.max(Number(inputs.annualMaintenancePercent) || 0.01, 0.005), 0.05),
      vacancyRate: Math.min(Math.max(Number(inputs.vacancyRate) || 0.05, 0), 0.2),
      sellingCostPercent: Math.min(Math.max(Number(inputs.sellingCostPercent) || 0.08, 0.05), 0.1)
    }
    
    // Use setTimeout to simulate async and let UI update
    setTimeout(() => {
      const results = calculateRentVsSell(safeInputs)
      setIsCalculating(false)
      onComplete(results)
    }, 100)
  }

  const formatCurrency = (value) => {
    const numValue = Number(value)
    if (isNaN(numValue) || !isFinite(numValue)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Input Controls */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Customize Your Scenario</h2>
          
          {propertyData?.address && (
            <p className="text-sm text-gray-500 mb-4 break-words">{propertyData.address}</p>
          )}
          
          <div className="space-y-6">
            {/* Home Value */}
            <div>
              <label className="slider-label">Home Value</label>
              <input
                type="range"
                min={50000}
                max={2000000}
                step={10000}
                value={inputs.homeValue}
                onChange={(e) => handleSliderChange('homeValue', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Current value</span>
                <span className="value-display">{formatCurrency(inputs.homeValue)}</span>
              </div>
            </div>

            {/* Mortgage Balance */}
            <div>
              <label className="slider-label">Mortgage Balance</label>
              <input
                type="range"
                min={0}
                max={inputs.homeValue}
                step={10000}
                value={inputs.mortgageBalance}
                onChange={(e) => handleSliderChange('mortgageBalance', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">What you owe</span>
                <span className="value-display">{formatCurrency(inputs.mortgageBalance)}</span>
              </div>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="slider-label">Monthly Rental Income</label>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={inputs.monthlyRent}
                onChange={(e) => handleSliderChange('monthlyRent', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">What you could charge</span>
                <span className="value-display">{formatCurrency(inputs.monthlyRent)}/mo</span>
              </div>
            </div>

            {/* Monthly Mortgage Payment */}
            <div>
              <label className="slider-label">Monthly Mortgage Payment</label>
              <input
                type="range"
                min={0}
                max={50000}
                step={100}
                value={inputs.monthlyMortgagePayment}
                onChange={(e) => handleSliderChange('monthlyMortgagePayment', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Your monthly payment</span>
                <span className="value-display">{formatCurrency(inputs.monthlyMortgagePayment)}/mo</span>
              </div>
            </div>

            {/* Holding Period */}
            <div>
              <label className="slider-label">How long would you keep renting it out?</label>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={inputs.holdingPeriod}
                onChange={(e) => handleSliderChange('holdingPeriod', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Years until you sell</span>
                <span className="value-display">{inputs.holdingPeriod} years</span>
              </div>
            </div>

            {/* Appreciation Rate */}
            <div>
              <label className="slider-label">Expected Annual Home Appreciation</label>
              <input
                type="range"
                min={0}
                max={0.15}
                step={0.005}
                value={inputs.appreciationRate}
                onChange={(e) => handleSliderChange('appreciationRate', e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">Local market forecast</span>
                <span className="value-display">{(inputs.appreciationRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button onClick={onBack} className="btn-secondary flex-1">
              ← Back
            </button>
            <button 
              onClick={handleCalculate}
              disabled={isCalculating}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {isCalculating ? 'Calculating...' : 'See My Results →'}
            </button>
          </div>
        </div>

        {/* Right Column - Preview Chart */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Live Preview</h3>
          <p className="text-gray-600 mb-6 text-sm">
            Adjust the sliders to see how your wealth changes in real-time
          </p>
          <WealthChart 
            inputs={inputs} 
            rentWealth={Math.min(inputs.monthlyRent * 12 * inputs.holdingPeriod, 10000000)}
            sellWealth={Math.max(0, inputs.homeValue - inputs.mortgageBalance)}
          />
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 Tip: Try adjusting the holding period to find your break-even point
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DecisionEngine