import React, { useState } from 'react'
import { supabase } from '../services/supabase'

function AgentRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company_name: '',
    license_number: '',
    bio: '',
    years_experience: '',
    specialties: [],
    service_areas: [],
    website_url: ''
  })
  const [specialty, setSpecialty] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const specialtiesList = [
    'Residential', 'Commercial', 'Luxury', 'First-time Buyers',
    'Investment Properties', 'Foreclosures', 'Short Sales', 'Relocation'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    try {
      // Check if agent already exists
      const { data: existing, error: checkError } = await supabase
        .from('agents')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existing) {
        setError('An agent with this email already exists. Please login.')
        setIsSubmitting(false)
        return
      }

      // Create Auth User
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'agent',
            company_name: formData.company_name
          }
        }
      })

      if (authError) throw authError

      // Create Agent Profile
      const agentData = {
        id: authUser.user.id,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        license_number: formData.license_number,
        bio: formData.bio,
        years_experience: parseInt(formData.years_experience) || 0,
        specialties: formData.specialties,
        website_url: formData.website_url,
        active: false,
        created_at: new Date().toISOString()
      }

      const { error: insertError } = await supabase
        .from('agents')
        .insert([agentData])

      if (insertError) throw insertError

      // Insert service areas
      if (formData.service_areas.length > 0) {
        const serviceAreasData = formData.service_areas.map(zip => ({
          agent_id: authUser.user.id,
          zip_code: zip
        }))
        
        const { error: areaError } = await supabase
          .from('agent_service_areas')
          .insert(serviceAreasData)
        
        if (areaError) console.error('Error adding service areas:', areaError)
      }

      setSuccess(true)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSpecialty = () => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      })
      setSpecialty('')
    }
  }

  const removeSpecialty = (spec) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== spec)
    })
  }

  const addServiceArea = () => {
    if (serviceArea && /^\d{5}$/.test(serviceArea) && !formData.service_areas.includes(serviceArea)) {
      setFormData({
        ...formData,
        service_areas: [...formData.service_areas, serviceArea]
      })
      setServiceArea('')
    } else if (serviceArea && !/^\d{5}$/.test(serviceArea)) {
      alert('Please enter a valid 5-digit zip code')
    }
  }

  const removeServiceArea = (area) => {
    setFormData({
      ...formData,
      service_areas: formData.service_areas.filter(a => a !== area)
    })
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-4">Application Received!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to join our agent network. Your application is pending admin approval.
            <br />
            <br />
            You will receive an email once your account is approved.
          </p>
          <a href="/agent-login" className="btn-primary inline-block">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2 text-center">Become a Partner Agent</h1>
        <p className="text-gray-600 text-center mb-8">
          Join RentalOrSale.com and get qualified leads from homeowners in your area.
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold mb-4 text-blue-600">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="agent@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Business Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold mb-4 text-blue-600">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Real Estate Company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Real Estate License Number *</label>
                <input
                  type="text"
                  required
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="License #"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="50"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website (optional)</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio / About You</label>
                <textarea
                  rows="4"
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell potential clients about yourself and your expertise..."
                />
              </div>
            </div>
          </div>

          {/* Specialties Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold mb-4 text-blue-600">Specialties & Service Areas</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Specialties</label>
              <div className="flex gap-2 mb-2">
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  <option value="">Select a specialty</option>
                  {specialtiesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button type="button" onClick={addSpecialty} className="btn-secondary px-4 rounded-lg">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map(spec => (
                  <span key={spec} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {spec}
                    <button type="button" onClick={() => removeSpecialty(spec)} className="text-blue-600 hover:text-blue-800">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Areas (Zip Codes)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g., 90210"
                  maxLength="5"
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button type="button" onClick={addServiceArea} className="btn-secondary px-4 rounded-lg">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.service_areas.map(area => (
                  <span key={area} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {area}
                    <button type="button" onClick={() => removeServiceArea(area)} className="text-green-600 hover:text-green-800">×</button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Enter 5-digit zip codes where you serve clients</p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-bold mb-2">Benefits of joining:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Receive qualified leads from your service areas</li>
              <li>✓ No monthly fees - pay only for leads you receive</li>
              <li>✓ Featured placement in our agent directory</li>
              <li>✓ Client reviews and ratings</li>
              <li>✓ Dedicated support team</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-3"
          >
            {isSubmitting ? 'Submitting...' : 'Apply to Join →'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AgentRegister