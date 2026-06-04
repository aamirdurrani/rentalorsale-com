import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { generatePDF } from '../utils/generatePDF'

function LeadCapture({ propertyData, results, onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    acceptTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const leadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
      property_address: propertyData?.address || 'Not provided',
      home_value: results?.sellWealth || results?.rentWealth || null,
      monthly_rent: propertyData?.estimatedRent || null,
      holding_period: results?.holdingPeriod || null,
      recommendation: results?.betterOption || null,
      wealth_difference: results?.wealthDifference || null,
      created_at: new Date().toISOString()
    }

    try {
      // Save to Supabase
      const { error: supabaseError } = await supabase
        .from('leads')
        .insert([leadData])

      if (supabaseError) throw supabaseError
      console.log('✅ Lead saved successfully!')
      
      setSuccess(true)
      
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-2xl font-bold mb-2">Your Report is Ready!</h3>
        <p className="text-gray-600 mb-4">
          Click the button below to download your analysis.
        </p>
        <button 
          onClick={() => generatePDF(propertyData, results)}
          className="btn-primary w-full mb-3"
        >
          Download PDF Report →
        </button>
        <button onClick={onComplete} className="btn-secondary w-full">
          Return to Results
        </button>
        <p className="text-xs text-gray-400 mt-4">
          We've also saved your report. We'll email it to you when we launch on rentalorsale.com
        </p>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Get Your Free Report</h3>
      <p className="text-gray-600 text-center mb-6">
        Enter your details to download your analysis
      </p>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="John Smith"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="(555) 123-4567"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={(e) => setFormData({...formData, acceptTerms: e.target.checked})}
            className="w-4 h-4"
          />
          <label className="text-sm text-gray-600">
            I agree to receive the report and occasional market updates
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving...
            </span>
          ) : (
            'Generate My Report →'
          )}
        </button>
        
        <p className="text-xs text-gray-400 text-center">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </form>
    </div>
  )
}

export default LeadCapture