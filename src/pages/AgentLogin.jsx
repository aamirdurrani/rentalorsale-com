import React, { useState } from 'react'
import { supabase } from '../services/supabase'

function AgentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Check if agent exists and is approved
      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('id, email, active, company_name')
        .eq('email', email)
        .maybeSingle()

      if (agentError || !agent) {
        setError('Agent account not found. Please register first at /agent-register')
        setLoading(false)
        return
      }

      if (!agent.active) {
        setError('Your account is pending approval. We will notify you once approved.')
        setLoading(false)
        return
      }

      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
          setError('Invalid email or password')
        } else {
          setError(signInError.message)
        }
        setLoading(false)
        return
      }

      // Login successful
      localStorage.setItem('agent_id', agent.id)
      localStorage.setItem('agent_email', agent.email)
      localStorage.setItem('agent_company', agent.company_name)
      
      window.location.href = '/agent-dashboard'
      
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail)
      if (error) throw error
      setResetSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (showReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-500 mt-2">Enter your email to receive reset instructions</p>
          </div>

          {resetSent ? (
            <div className="text-center">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
                ✅ Password reset email sent! Check your inbox.
              </div>
              <button
                onClick={() => setShowReset(false)}
                className="btn-primary w-full"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="agent@example.com"
                />
              </div>
              
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowReset(false)}
                className="text-sm text-gray-500 hover:text-gray-700 w-full text-center"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold">Agent Login</h1>
          <p className="text-gray-500 mt-2">Access your agent dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="agent@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={() => setShowReset(true)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Forgot password?
          </button>
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/agent-register" className="text-blue-600 hover:text-blue-800">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentLogin