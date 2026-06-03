import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function WealthChart({ inputs, rentWealth, sellWealth }) {
  // Generate data points for each year
  const generateChartData = () => {
    const data = []
    let rentWealthYearly = 0
    let sellWealthYearly = sellWealth
    
    for (let year = 1; year <= inputs.holdingPeriod; year++) {
      // Simple projection (you can make this more sophisticated)
      rentWealthYearly += inputs.monthlyRent * 12 * (1 - inputs.vacancyRate) * (1 + inputs.investmentReturnRate)
      rentWealthYearly *= (1 + inputs.appreciationRate)
      
      data.push({
        year: year,
        rent: Math.round(rentWealthYearly),
        sell: Math.round(sellWealthYearly * (1 + inputs.appreciationRate * year))
      })
    }
    return data
  }

  const chartData = generateChartData()

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-bold">Year {label}</p>
          <p className="text-blue-600">Renting: ${payload[0]?.value?.toLocaleString()}</p>
          <p className="text-green-600">Selling: ${payload[1]?.value?.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="year" 
            label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            tickFormatter={(value) => `$${(value / 1000)}k`}
            label={{ value: 'Total Wealth', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="rent" 
            stroke="#2563EB" 
            strokeWidth={3} 
            name="Rent & Sell Later"
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="sell" 
            stroke="#10B981" 
            strokeWidth={3} 
            name="Sell Now"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WealthChart