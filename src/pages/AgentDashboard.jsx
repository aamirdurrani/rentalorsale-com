import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

function AgentDashboard() {
  const [agent, setAgent] = useState(null)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('leads')
  const [stats, setStats] = useState({
    total_leads: 0,
    pending_leads: 0,
    contacted_leads: 0,
    converted_leads: 0
  })

  useEffect(() => {
    // Check if agent is logged in
    const agentId = localStorage.getItem('agent_id')
    const agentEmail = localStorage.getItem('agent_email')
    
    if (!agentId && !agentEmail) {
      window.location.href = '/agent-login'
      return
    }
    
    fetchAgentData(agentId, agentEmail)
  }, [])

  const fetchAgentData = async (agentId, agentEmail) => {
    setLoading(true)
    try {
      let agentData = null
      
      if (agentId) {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('id', agentId)
          .single()
        
        if (!error && data) agentData = data
      }
      
      if (!agentData && agentEmail) {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .eq('email', agentEmail)
          .single()
        
        if (!error && data) agentData = data
      }
      
      if (!agentData) {
        window.location.href = '/agent-login'
        return
      }
      
      setAgent(agentData)
      
      // Fetch leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('agent_leads')
        .select('*')
        .eq('agent_id', agentData.id)
        .order('created_at', { ascending: false })
      
      if (!leadsError) {
        setLeads(leadsData || [])
        setStats({
          total_leads: leadsData?.length || 0,
          pending_leads: leadsData?.filter(l => l.status === 'pending').length || 0,
          contacted_leads: leadsData?.filter(l => l.status === 'contacted').length || 0,
          converted_leads: leadsData?.filter(l => l.status === 'converted').length || 0
        })
      }
      
    } catch (error) {
      console.error('Error fetching agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('agent_id')
    localStorage.removeItem('agent_email')
    localStorage.removeItem('agent_company')
    window.location.href = '/agent-login'
  }

  // Rest of your dashboard component remains the same...
  // (Keep all the existing dashboard JSX)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Add logout button */}
      <div className="flex justify-end mb-4">
        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">
          Logout
        </button>
      </div>
      
      {/* Rest of your dashboard content */}
    </div>
  )
}

export default AgentDashboard