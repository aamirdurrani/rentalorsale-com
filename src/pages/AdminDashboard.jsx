import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pendingAgents, setPendingAgents] = useState([])
  const [approvedAgents, setApprovedAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionStatus, setActionStatus] = useState(null) // 'approving', 'rejecting'

  // Check admin authentication
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem('admin_logged_in')
    const adminEmail = localStorage.getItem('admin_email')
    
    const adminEmails = ['admin@rentalorsale.com', 'aamir@rentalorsale.com', 'info@aamirsaba.com']
    
    if (!adminLoggedIn || !adminEmail || !adminEmails.includes(adminEmail)) {
      window.location.href = '/admin-login'
      return
    }
    
    setIsAuthenticated(true)
    fetchAgents()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    localStorage.removeItem('admin_email')
    window.location.href = '/admin-login'
  }

  const fetchAgents = async () => {
    setLoading(true)
    try {
      // Fetch pending agents
      const { data: pending, error: pendingError } = await supabase
        .from('agents')
        .select('*')
        .eq('active', false)
        .order('created_at', { ascending: false })

      if (pendingError) throw pendingError
      setPendingAgents(pending || [])

      // Fetch approved agents
      const { data: approved, error: approvedError } = await supabase
        .from('agents')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (approvedError) throw approvedError
      setApprovedAgents(approved || [])

    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmailNotification = async (email, subject, message) => {
    try {
      const response = await fetch('/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          subject: subject,
          message: message,
          type: 'admin_notification'
        })
      })
      return await response.json()
    } catch (error) {
      console.error('Email error:', error)
      return { success: false }
    }
  }

  const approveAgent = async (agent) => {
    setActionStatus('approving')
    try {
      const { error } = await supabase
        .from('agents')
        .update({ 
          active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', agent.id)

      if (error) throw error

      // Send approval email to agent
      await sendEmailNotification(
        agent.email,
        'Your Agent Application has been Approved!',
        `
        <h2>Congratulations ${agent.company_name}!</h2>
        <p>Your application to join RentalOrSale.com has been <strong>APPROVED</strong>.</p>
        <p>You can now login to your agent dashboard at:</p>
        <p><a href="https://rentalorsale.com/agent-login">https://rentalorsale.com/agent-login</a></p>
        <p>Use the email <strong>${agent.email}</strong> and the password you created during registration.</p>
        <br/>
        <p>Start receiving leads from homeowners in your area!</p>
        <br/>
        <p>Best regards,<br/>RentalOrSale.com Team</p>
        `
      )

      fetchAgents()
      setShowModal(false)
      setActionStatus(null)
      
    } catch (error) {
      console.error('Error approving agent:', error)
      alert('Failed to approve agent')
      setActionStatus(null)
    }
  }

  const rejectAgent = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    setActionStatus('rejecting')
    try {
      // Send rejection email to agent
      await sendEmailNotification(
        selectedAgent.email,
        'Your Agent Application Status Update',
        `
        <h2>Regarding your application to RentalOrSale.com</h2>
        <p>Thank you for your interest in joining our agent network.</p>
        <p>After careful review, we regret to inform you that your application has been <strong>REJECTED</strong> at this time.</p>
        <p><strong>Reason provided:</strong> ${rejectReason}</p>
        <br/>
        <p>If you have any questions, please contact us at support@rentalorsale.com</p>
        <br/>
        <p>Best regards,<br/>RentalOrSale.com Team</p>
        `
      )

      // Delete the agent record
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', selectedAgent.id)

      if (error) throw error

      fetchAgents()
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedAgent(null)
      setActionStatus(null)
      
    } catch (error) {
      console.error('Error rejecting agent:', error)
      alert('Failed to reject agent')
      setActionStatus(null)
    }
  }

  const viewAgentDetails = (agent) => {
    setSelectedAgent(agent)
    setShowModal(true)
  }

  const openRejectModal = (agent) => {
    setSelectedAgent(agent)
    setShowRejectModal(true)
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header with logout */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-yellow-600">{pendingAgents.length}</div>
          <div className="text-gray-500">Pending Approvals</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600">{approvedAgents.length}</div>
          <div className="text-gray-500">Active Agents</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-600">{pendingAgents.length + approvedAgents.length}</div>
          <div className="text-gray-500">Total Agents</div>
        </div>
      </div>

      {/* Pending Agents */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Pending Approvals</h2>
        {pendingAgents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending agent applications</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Company</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">License</th>
                  <th className="text-left py-3">Actions</th>
                 </tr>
              </thead>
              <tbody>
                {pendingAgents.map((agent) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">{new Date(agent.created_at).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">{agent.company_name}</td>
                    <td className="py-3">{agent.email}</td>
                    <td className="py-3">{agent.license_number}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewAgentDetails(agent)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => approveAgent(agent)}
                          disabled={actionStatus === 'approving'}
                          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          {actionStatus === 'approving' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => openRejectModal(agent)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Agents */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Active Agents</h2>
        {approvedAgents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No active agents yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Company</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Experience</th>
                  <th className="text-left py-3">Rating</th>
                 </tr>
              </thead>
              <tbody>
                {approvedAgents.map((agent) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">{agent.company_name}</td>
                    <td className="py-3">{agent.email}</td>
                    <td className="py-3">{agent.years_experience} years</td>
                    <td className="py-3">★ {agent.rating || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Agent Details Modal */}
      {showModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Agent Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium">{selectedAgent.company_name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email</div>
                <div className="font-medium">{selectedAgent.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone</div>
                <div className="font-medium">{selectedAgent.phone || 'Not provided'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">License Number</div>
                <div className="font-medium">{selectedAgent.license_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Years Experience</div>
                <div className="font-medium">{selectedAgent.years_experience} years</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Specialties</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedAgent.specialties?.map(s => (
                    <span key={s} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bio</div>
                <div className="text-sm">{selectedAgent.bio || 'No bio provided'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Website</div>
                <a href={selectedAgent.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
                  {selectedAgent.website_url || 'Not provided'}
                </a>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => approveAgent(selectedAgent)}
                className="flex-1 btn-primary"
              >
                Approve Agent
              </button>
              <button
                onClick={() => openRejectModal(selectedAgent)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-red-600">Reject Application</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <p className="text-gray-600 mb-4">
              You are about to reject <strong>{selectedAgent.company_name}</strong>'s application.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason for Rejection *</label>
              <textarea
                rows="4"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Please provide a reason for rejection. The agent will receive this in an email."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={rejectAgent}
                disabled={actionStatus === 'rejecting'}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionStatus === 'rejecting' ? 'Sending...' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard