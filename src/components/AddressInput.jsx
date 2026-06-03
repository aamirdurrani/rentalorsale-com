import React, { useState, useEffect, useRef } from 'react'
import { getPropertyData } from '../services/propertyData'

function AddressInput({ onSubmit }) {
  const [address, setAddress] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isApiReady, setIsApiReady] = useState(false)
  const [autoFetchStatus, setAutoFetchStatus] = useState('')
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Load Google Maps API - ONLY ONCE
  useEffect(() => {
    // If already loaded, don't load again
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps already loaded')
      setIsApiReady(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      console.error('❌ API key not found')
      return
    }
    
    // Check if script already exists
    if (document.querySelector('#google-maps-script')) {
      console.log('Script already exists, waiting...')
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsApiReady(true)
          clearInterval(checkInterval)
        }
      }, 100)
      return
    }
    
    const script = document.createElement('script')
    script.id = 'google-maps-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      console.log('✅ Google Maps API loaded')
      setIsApiReady(true)
    }
    script.onerror = () => console.error('Failed to load Google Maps API')
    document.head.appendChild(script)
    
    // Cleanup
    return () => {
      // Don't remove the script, just clean up autocomplete
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  // Extract zip code from place
  const extractZipCode = (place) => {
    if (place && place.address_components) {
      const zipComponent = place.address_components.find(component =>
        component.types.includes('postal_code')
      )
      return zipComponent ? zipComponent.long_name : 'unknown'
    }
    return 'unknown'
  }

  // Auto-fetch property data when address is selected
  const autoFetchPropertyData = async (formattedAddress, place) => {
    setIsLoading(true)
    setAutoFetchStatus('🔄 Fetching property data...')
    
    try {
      const zipCode = extractZipCode(place)
      setAutoFetchStatus('📊 Analyzing market data...')
      
      const propertyData = await getPropertyData(formattedAddress, zipCode)
      
      setAutoFetchStatus('✅ Found! Redirecting to calculator...')
      
      setTimeout(() => {
        onSubmit({
          address: propertyData.address,
          estimatedValue: propertyData.estimatedValue,
          estimatedRent: propertyData.estimatedRent,
          estimatedMortgage: propertyData.estimatedMortgage,
          propertyType: propertyData.propertyType,
          source: propertyData.source,
          confidence: propertyData.confidence
        })
        setIsLoading(false)
        setAutoFetchStatus('')
      }, 500)
      
    } catch (error) {
      console.error('Auto-fetch error:', error)
      setAutoFetchStatus('⚠️ Using estimate...')
      
      setTimeout(() => {
        onSubmit({
          address: formattedAddress,
          estimatedValue: 425000,
          estimatedRent: 2125,
          estimatedMortgage: 1700,
          isEstimated: true
        })
        setIsLoading(false)
        setAutoFetchStatus('')
      }, 500)
    }
  }

  // Initialize autocomplete - ONLY ONCE
  useEffect(() => {
    if (!isApiReady || !inputRef.current) return
    
    // Don't re-initialize if already exists
    if (autocompleteRef.current) return

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        if (place && place.formatted_address) {
          setAddress(place.formatted_address)
          autoFetchPropertyData(place.formatted_address, place)
        }
      })

      console.log('✅ Autocomplete ready!')
    } catch (error) {
      console.error('Error initializing autocomplete:', error)
    }
  }, [isApiReady])

  const handleSubmit = () => {
    if (!address.trim()) {
      alert('Please enter an address')
      return
    }
    
    setIsLoading(true)
    setAutoFetchStatus('🔍 Looking up address...')
    
    setTimeout(() => {
      onSubmit({
        address: address,
        estimatedValue: 425000,
        estimatedRent: 2125,
        estimatedMortgage: 1700,
        manualEntry: true
      })
      setIsLoading(false)
      setAutoFetchStatus('')
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="card text-center">
        <h2 className="text-3xl font-bold mb-4">Where is your property located?</h2>
        <p className="text-gray-600 mb-8">Start typing your address - we'll auto-fetch property data!</p>
        
        <div className="max-w-xl mx-auto space-y-4">
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g., 123 Main St, Austin, TX"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            disabled={isLoading}
          />
          
          {!isApiReady && (
            <p className="text-sm text-yellow-600">Loading address search...</p>
          )}
          
          {isApiReady && !isLoading && (
            <p className="text-sm text-green-600">✅ Ready! Type an address and select from dropdown - we'll auto-fetch data!</p>
          )}
          
          {isLoading && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-600">{autoFetchStatus}</p>
              <div className="w-full bg-blue-200 rounded-full h-1 mt-2">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !address.trim()}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isLoading ? 'Fetching Property Data...' : 'Analyze My Property →'}
          </button>
          
          <p className="text-xs text-gray-400">
            💡 Just start typing your address and select from the dropdown - we'll fetch everything automatically!
          </p>
        </div>
      </div>
    </div>
  )
}

export default AddressInput