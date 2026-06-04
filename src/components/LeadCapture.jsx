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
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Function to send email via PHP (Hostinger)
  const sendEmailReport = async () => {
    console.log('📧 Attempting to send email to:', formData.email)
    
    try {
        // Use current domain (works on localhost and live)
        const baseUrl = window.location.origin;
        // CHANGE: Use /send-email.php (PHP version) instead of /api/send-email
        const response = await fetch(`${baseUrl}/send-email.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
        
        console.log('📧 Response status:', response.status)
        
        const data = await response.json();
        console.log('📧 Response data:', data)
        
        if (data.success) {
            console.log('✅ Email sent successfully!');
            return true;
        } else {
            console.error('❌ Email failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Email send error:', error);
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

    console.log('📝 Sending lead data to Supabase:', leadData)

    try {
      // Save to Supabase
      const { data, error: supabaseError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()

      if (supabaseError) throw supabaseError
      console.log('✅ Lead saved successfully!', data)
      
      // Send email via PHP
      const emailSent = await sendEmailReport();
      
      if (emailSent) {
        setSuccess(true)
      } else {
        setError('Report saved but email failed. We will send it shortly.')
        setTimeout(() => onComplete(), 2000)
      }
      
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
        <div className="text-6xl mb-4">📧</div>
        <h3 className="text-2xl font-bold mb-2">Report Sent!</h3>
        <p className="text-gray-600 mb-4">
          We've sent the analysis report to <strong>{formData.email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Please check your inbox (and spam folder).
        </p>
        <button onClick={onComplete} className="btn-primary">
          Return to Results →
        </button>
      </div>
    )
  }

  return (
    <div className="card max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-center">Get Your Free Report</h3>
      <p className="text-gray-600 text-center mb-6">
        Enter your details to receive the complete analysis
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
              Sending...
            </span>
          ) : (
            'Send My Report →'
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