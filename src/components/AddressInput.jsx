import React, { useState, useEffect, useRef } from 'react'
import { getPropertyData } from '../services/propertyData'

function AddressInput({ onSubmit }) {
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApiReady, setIsApiReady] = useState(false)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsApiReady(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      console.error('❌ API key not found in .env file')
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google Maps API loaded')
      setIsApiReady(true)
    }
    script.onerror = () => console.error('Failed to load Google Maps API')
    document.head.appendChild(script)
  }, [])

  // Function to extract zip code from place
  const extractZipCode = (place) => {
    if (place && place.address_components) {
      const zipComponent = place.address_components.find(component =>
        component.types.includes('postal_code')
      )
      return zipComponent ? zipComponent.long_name : 'unknown'
    }
    return 'unknown'
  }

  // Initialize autocomplete when API is ready
  useEffect(() => {
    if (!isApiReady || !inputRef.current || autocompleteRef.current) return

    try {
      // Create autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })

      // Add listener for when a place is selected
      autocompleteRef.current.addListener('place_changed', async () => {
        const place = autocompleteRef.current.getPlace()
        if (place && place.formatted_address) {
          setAddress(place.formatted_address)
          setIsLoading(true)
          
          try {
            // Extract zip code
            const zipCode = extractZipCode(place)
            
            // Get REAL property data from Apify Actor
            console.log(`Fetching property data for: ${place.formatted_address}`)
            const propertyData = await getPropertyData(place.formatted_address, zipCode)
            
            console.log('Property data received:', propertyData)
            
            // Submit the real data to parent component
            onSubmit({
              address: propertyData.address,
              estimatedValue: propertyData.estimatedValue,
              estimatedRent: propertyData.estimatedRent,
              estimatedMortgage: propertyData.estimatedMortgage,
              propertyType: propertyData.propertyType,
              source: propertyData.source
            })
          } catch (error) {
            console.error('Error fetching property data:', error)
            // Fallback to mock data if API fails
            onSubmit({
              address: place.formatted_address,
              estimatedValue: Math.floor(Math.random() * 400000) + 300000,
              estimatedRent: Math.floor(Math.random() * 2000) + 1500,
              estimatedMortgage: Math.floor(Math.random() * 1500) + 1000,
              isEstimated: true
            })
          } finally {
            setIsLoading(false)
          }
        }
      })

      console.log('✅ Autocomplete ready!')
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
    }
  }, [isApiReady, onSubmit])

  const handleSubmit = async () => {
    if (!address.trim()) {
      alert('Please enter an address')
      return
    }
    
    setIsLoading(true)
    try {
      // Try to get property data for manually entered address
      const propertyData = await getPropertyData(address, 'unknown')
      onSubmit({
        address: propertyData.address,
        estimatedValue: propertyData.estimatedValue,
        estimatedRent: propertyData.estimatedRent,
        estimatedMortgage: propertyData.estimatedMortgage,
        propertyType: propertyData.propertyType,
        manualEntry: true
      })
    } catch (error) {
      console.error('Error:', error)
      // Fallback
      onSubmit({
        address: address,
        estimatedValue: 425000,
        estimatedRent: 2125,
        estimatedMortgage: 1700,
        manualEntry: true,
        isEstimated: true
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="card text-center">
        <h2 className="text-3xl font-bold mb-4">Where is your property located?</h2>
        <p className="text-gray-600 mb-8">Start typing your address for suggestions</p>
        
        <div className="max-w-xl mx-auto space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main St, Austin, TX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          
          {!isApiReady && (
            <p className="text-sm text-yellow-600">Loading address search...</p>
          )}
          
          {isApiReady && (
            <p className="text-sm text-green-600">✅ Start typing - suggestions will appear</p>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !address.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Fetching Property Data...' : 'Analyze My Property →'}
          </button>
          
          <p className="text-xs text-gray-400">
            💡 Type your address and select from the dropdown suggestions
          </p>
        </div>
      </div>
    </div>
  )
}

export default AddressInput