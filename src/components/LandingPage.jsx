import React from 'react'

function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Rent or Sell?
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-4">
            Stop guessing. See your actual financial future.
          </p>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
            Our AI-powered decision engine compares renting vs selling your home based on real market data, taxes, and your personal goals.
          </p>
          
          <button 
            onClick={onGetStarted}
            className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all"
          >
            Get Your Answer →
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">60 Seconds</h3>
            <p className="text-gray-600">Just enter your address and adjust a few sliders</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Real Market Data</h3>
            <p className="text-gray-600">Live comps, rental rates, and appreciation trends</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">Interactive Charts</h3>
            <p className="text-gray-600">See your wealth grow side-by-side over 1-30 years</p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-center">
          <p className="text-gray-500 mb-4">Trusted by homeowners making life-changing decisions</p>
          <div className="flex justify-center gap-8 text-gray-400">
            <span>★★★★★ (4.9/5)</span>
            <span>10,000+ analyses run</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage