import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

function AgentMatch({ zipCode, propertyValue, recommendation }) {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!zipCode) return
    
    const fetchAgents = async () => {
      setLoading(true)
      try {
        // Fetch agents that service this zip code
        const { data, error } = await supabase
          .from('agents')
          .select(`
            *,
            agent_service_areas!inner(zip_code)
          `)
          .eq('agent_service_areas.zip_code', zipCode)
          .eq('active', true)
          .order('rating', { ascending: false })
          .limit(5)
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setAgents(data)
        } else {
          // Fallback to mock data if no agents found
          setAgents(getMockAgents())
        }
      } catch (error) {
        console.error('Error fetching agents:', error)
        setAgents(getMockAgents())
      } finally {
        setLoading(false)
      }
    }
    
    fetchAgents()
  }, [zipCode])

  const handleContactAgent = (agent) => {
    setSelectedAgent(agent)
    setContactForm({
      name: '',
      email: '',
      phone: '',
      message: `I'm interested in ${recommendation === 'rent' ? 'renting' : 'selling'} my property valued at $${propertyValue?.toLocaleString()}.`
    })
  }

  const handleSubmitContact = async (e) => {
    e.preventDefault()
    
    const leadData = {
      agent_id: selectedAgent.id,
      user_name: contactForm.name,
      user_email: contactForm.email,
      user_phone: contactForm.phone,
      property_value: propertyValue,
      recommendation: recommendation,
      message: contactForm.message,
      status: 'pending'
    }
    
    try {
      const { error } = await supabase
        .from('agent_leads')
        .insert([leadData])
      
      if (error) throw error
      
      // Here you would also send email notification to the agent
      console.log('Lead sent to agent:', selectedAgent.email)
      setSubmitted(true)
      
    } catch (error) {
      console.error('Error saving lead:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  // Rest of the component remains the same...
  // (return JSX from previous version)
}

function getMockAgents() {
  return [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "Johnson Realty Group",
      rating: 4.9,
      total_reviews: 127,
      bio: "Specializing in residential properties with 10+ years experience.",
      email: "sarah@johnsonrealty.com",
      phone: "(555) 123-4567"
    },
    // ... more mock agents
  ]
}

export default AgentMatch