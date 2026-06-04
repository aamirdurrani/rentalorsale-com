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
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({})

  // Get current agent from localStorage or session
  useEffect(() => {
    // For testing, use a demo agent ID
    // In production, you'd get this from authentication
    const demoAgentId = 'd290f1ee-6c54-4b01-90e6-d701748f0851' // Replace with actual agent ID
    
    fetchAgentData(demoAgentId)
  }, [])

  const fetchAgentData = async (agentId) => {
    setLoading(true)
    try {
      // Fetch agent profile
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (agentError) throw agentError
      setAgent(agentData)
      setProfileForm(agentData)

      // Fetch leads for this agent
      const { data: leadsData, error: leadsError } = await supabase
        .from('agent_leads')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (leadsError) throw leadsError
      setLeads(leadsData || [])

      // Calculate stats
      setStats({
        total_leads: leadsData?.length || 0,
        pending_leads: leadsData?.filter(l => l.status === 'pending').length || 0,
        contacted_leads: leadsData?.filter(l => l.status === 'contacted').length || 0,
        converted_leads: leadsData?.filter(l => l.status === 'converted').length || 0
      })

    } catch (error) {
      console.error('Error fetching agent data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      const { error } = await supabase
        .from('agent_leads')
        .update({ 
          status: newStatus,
          contacted_at: newStatus === 'contacted' ? new Date().toISOString() : null
        })
        .eq('id', leadId)

      if (error) throw error

      // Update local state
      setLeads(leads.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ))

      // Update stats
      setStats({
        total_leads: leads.length,
        pending_leads: leads.filter(l => l.id !== leadId ? l.status === 'pending' : newStatus !== 'pending').length,
        contacted_leads: leads.filter(l => l.id !== leadId ? l.status === 'contacted' : newStatus === 'contacted').length,
        converted_leads: leads.filter(l => l.id !== leadId ? l.status === 'converted' : newStatus === 'converted').length
      })

    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({
          company_name: profileForm.company_name,
          phone: profileForm.phone,
          bio: profileForm.bio,
          website_url: profileForm.website_url,
          specialties: profileForm.specialties,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)

      if (error) throw error

      setAgent({ ...agent, ...profileForm })
      setEditingProfile(false)
      alert('Profile updated successfully!')

    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  const formatCurrency = (value) => {
    if (!value) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="card">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
          <a href="/" className="btn-primary">Return Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-gray-600">Welcome back, {agent.company_name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'leads' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            📋 Leads
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'leads' && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-2xl font-bold">{stats.total_leads}</div>
            <div className="text-gray-500">Total Leads</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_leads}</div>
            <div className="text-gray-500">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-2">📞</div>
            <div className="text-2xl font-bold text-blue-600">{stats.contacted_leads}</div>
            <div className="text-gray-500">Contacted</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">{stats.converted_leads}</div>
            <div className="text-gray-500">Converted</div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      {activeTab === 'leads' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Leads</h2>
          {leads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No leads yet. Check back later!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3">Date</th>
                    <th className="text-left py-3">Client</th>
                    <th className="text-left py-3">Property Value</th>
                    <th className="text-left py-3">Recommendation</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{formatDate(lead.created_at)}</td>
                      <td className="py-3">
                        <div>
                          <div className="font-medium">{lead.user_name}</div>
                          <div className="text-sm text-gray-500">{lead.user_email}</div>
                          {lead.user_phone && <div className="text-sm text-gray-500">{lead.user_phone}</div>}
                        </div>
                      </td>
                      <td className="py-3">{formatCurrency(lead.property_value)}</td>
                      <td className="py-3">
                        <span className={lead.recommendation === 'rent' ? 'text-blue-600' : 'text-green-600'}>
                          {lead.recommendation === 'rent' ? '🏠 Rent' : '💰 Sell'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Profile Settings</h2>
            {!editingProfile && (
              <button onClick={() => setEditingProfile(true)} className="btn-secondary">
                Edit Profile
              </button>
            )}
          </div>

          {editingProfile ? (
            <form onSubmit={(e) => { e.preventDefault(); updateProfile(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={profileForm.company_name || ''}
                  onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone || ''}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  rows="4"
                  value={profileForm.bio || ''}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={profileForm.website_url || ''}
                  onChange={(e) => setProfileForm({...profileForm, website_url: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Save Changes</button>
                <button type="button" onClick={() => setEditingProfile(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{agent.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium">{agent.company_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">{agent.phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">License Number</div>
                <div className="font-medium">{agent.license_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Years Experience</div>
                <div className="font-medium">{agent.years_experience} years</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Rating</div>
                <div className="font-medium">★ {agent.rating} ({agent.total_reviews} reviews)</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bio</div>
                <div className="font-medium">{agent.bio || 'No bio provided'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Performance Analytics</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Lead Conversion</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversion Rate</span>
                    <span>{stats.total_leads ? Math.round((stats.converted_leads / stats.total_leads) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${stats.total_leads ? (stats.converted_leads / stats.total_leads) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Rate</span>
                    <span>{stats.total_leads ? Math.round(((stats.contacted_leads + stats.converted_leads) / stats.total_leads) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${stats.total_leads ? ((stats.contacted_leads + stats.converted_leads) / stats.total_leads) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Lead Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>🏠 Rent Recommendations</span>
                  <span>{leads.filter(l => l.recommendation === 'rent').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>💰 Sell Recommendations</span>
                  <span>{leads.filter(l => l.recommendation === 'sell').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentDashboard