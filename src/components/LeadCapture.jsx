import React, { useState } from 'react'
import { supabase } from '../services/supabase'

function LeadCapture({ propertyData, results, onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    acceptTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            property_address: propertyData.address,
            home_value: propertyData.estimatedValue,
            recommendation: results.betterOption,
            wealth_difference: results.wealthDifference
          }
        ])

      if (error) throw error

      // Here you would trigger an email with the PDF report
      console.log('Lead saved:', data)
      
      setIsSubmitting(false)
      onComplete()
    } catch (error) {
      console.error('Error saving lead:', error)
      setIsSubmitting(false)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Get Your Free Report</h3>
      <p className="text-gray-600 text-center mb-6">
        Enter your email and we'll send you the detailed analysis
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
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
          <label className="block text-sm font-medium mb-1">Email Address</label>
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
          {isSubmitting ? 'Sending...' : 'Send My Report →'}
        </button>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </form>
    </div>
  )
}

export default LeadCapture