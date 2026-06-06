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

  const sendEmail = async () => {
    console.log('📧 Sending email to:', formData.email)
    
    try {
      const response = await fetch('/send-email.php', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          property_address: propertyData?.address,
          recommendation: results?.betterOption,
          wealth_difference: results?.wealthDifference,
          rent_wealth: results?.rentWealth,
          sell_wealth: results?.sellWealth
        })
      });
      
      const data = await response.json();
      console.log('📧 Email response:', data);
      
      if (data.success) {
        console.log('✅ Email sent!');
        return true;
      } else {
        console.error('❌ Email failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Email error:', error);
      return false;
    }
  };

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
      console.log('✅ Lead saved!')
      
      // Send email
      await sendEmail();
      
      setSuccess(true)
      
    } catch (err) {
      console.error('❌ Error:', err)
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="card max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-2xl font-bold mb-2">Report Sent!</h3>
        <p className="text-gray-600 mb-4">
          We've sent the report to <strong>{formData.email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Check your inbox (and spam folder).
        </p>
        <button 
          onClick={() => generatePDF(propertyData, results)}
          className="btn-primary w-full mb-3"
        >
          Download PDF →
        </button>
        <button onClick={onComplete} className="btn-secondary w-full">
          Return to Results
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Get Your Free Report</h3>
      <p className="text-gray-600 text-center mb-6">
        Enter your details to receive the analysis
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
            I agree to receive the report
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send My Report →'}
        </button>
      </form>
    </div>
  )
}

export default LeadCapture