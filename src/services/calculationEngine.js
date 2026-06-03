// The core rent vs sell calculation engine - FIXED VERSION

export function calculateRentVsSell(inputs) {
  // SAFE VALUE EXTRACTION with limits
  const homeValue = Math.min(Number(inputs.homeValue) || 400000, 5000000)
  const mortgageBalance = Math.min(Number(inputs.mortgageBalance) || homeValue * 0.6, homeValue)
  const monthlyRent = Math.min(Number(inputs.monthlyRent) || homeValue * 0.005, homeValue * 0.02)
  const monthlyMortgagePayment = Math.min(Number(inputs.monthlyMortgagePayment) || homeValue * 0.004, monthlyRent)
  let holdingPeriod = Math.min(Math.max(1, Number(inputs.holdingPeriod) || 5), 30)
  const appreciationRate = Math.min(Math.max(0, Number(inputs.appreciationRate) || 0.03), 0.15)
  const investmentReturnRate = Math.min(Math.max(0, Number(inputs.investmentReturnRate) || 0.07), 0.15)
  const annualMaintenancePercent = Math.min(Math.max(0.005, Number(inputs.annualMaintenancePercent) || 0.01), 0.05)
  const vacancyRate = Math.min(Math.max(0, Number(inputs.vacancyRate) || 0.05), 0.2)
  const sellingCostPercent = Math.min(Math.max(0.05, Number(inputs.sellingCostPercent) || 0.08), 0.1)

  // Cap holding period to prevent excessive recursion
  holdingPeriod = Math.min(holdingPeriod, 30)

  // ============ SCENARIO A: SELL NOW ============
  const sellingCosts = homeValue * sellingCostPercent
  const sellProceeds = homeValue - sellingCosts
  const mortgagePayoff = mortgageBalance
  const sellWealth = Math.max(0, sellProceeds - mortgagePayoff)

  // ============ SCENARIO B: RENT AND SELL LATER ============
  let rentWealth = 0
  let currentHomeValue = homeValue
  let currentEquity = homeValue - mortgageBalance
  
  let totalRentalIncome = 0
  let totalExpenses = 0
  let totalAppreciation = 0
  
  // Simple loop without recursion
  for (let year = 1; year <= holdingPeriod; year++) {
    // Annual rental income (accounting for vacancy)
    const annualRentIncome = monthlyRent * 12 * (1 - vacancyRate)
    totalRentalIncome += annualRentIncome
    
    // Annual expenses
    const annualMaintenance = currentHomeValue * annualMaintenancePercent
    const annualMortgage = monthlyMortgagePayment * 12
    const annualExpenses = annualMaintenance + annualMortgage
    totalExpenses += annualExpenses
    
    // Cash flow from rental
    const cashFlow = annualRentIncome - annualExpenses
    
    // Home appreciation for this year
    const yearlyAppreciation = currentHomeValue * appreciationRate
    totalAppreciation += yearlyAppreciation
    
    // Update wealth (invest cash flow and add appreciation)
    rentWealth = rentWealth + cashFlow
    rentWealth = rentWealth + yearlyAppreciation
    
    // Update for next year
    currentHomeValue = currentHomeValue + yearlyAppreciation
    currentEquity = currentEquity + yearlyAppreciation + (annualMortgage * 0.3) // approximate principal paydown
  }
  
  // Subtract selling costs at the end
  const finalSellingCosts = currentHomeValue * sellingCostPercent
  rentWealth = Math.max(0, rentWealth - finalSellingCosts)
  
  // Calculate difference
  const wealthDifference = rentWealth - sellWealth
  
  // Calculate simple break-even year (without recursion to avoid stack overflow)
  let breakevenYear = null
  if (wealthDifference > 0 && sellWealth > 0) {
    // Approximate break-even
    const monthlyRentNet = monthlyRent * 12 * (1 - vacancyRate) - (homeValue * annualMaintenancePercent) - (monthlyMortgagePayment * 12)
    if (monthlyRentNet > 0) {
      const annualAdvantage = monthlyRentNet + (homeValue * appreciationRate)
      if (annualAdvantage > 0) {
        breakevenYear = Math.ceil((sellWealth - rentWealth) / annualAdvantage)
        breakevenYear = Math.min(Math.max(1, breakevenYear), 30)
      }
    }
  } else if (wealthDifference < 0 && rentWealth > 0) {
    const monthlyRentNet = monthlyRent * 12 * (1 - vacancyRate) - (homeValue * annualMaintenancePercent) - (monthlyMortgagePayment * 12)
    if (monthlyRentNet > 0) {
      const annualAdvantage = monthlyRentNet + (homeValue * appreciationRate)
      if (annualAdvantage > 0) {
        breakevenYear = Math.ceil((sellWealth - rentWealth) / annualAdvantage)
        breakevenYear = Math.min(Math.max(1, breakevenYear), 30)
      }
    }
  }
  
  // Generate recommendation text
  const recommendation = generateRecommendation(
    wealthDifference,
    sellWealth,
    rentWealth,
    breakevenYear,
    holdingPeriod
  )
  
  return {
    betterOption: wealthDifference > 0 ? 'rent' : 'sell',
    wealthDifference: Math.abs(Math.round(wealthDifference)),
    rentWealth: Math.round(rentWealth),
    sellWealth: Math.round(sellWealth),
    sellProceeds: Math.round(sellProceeds),
    sellingCosts: Math.round(sellingCosts),
    mortgagePayoff: Math.round(mortgagePayoff),
    totalRentalIncome: Math.round(totalRentalIncome),
    totalExpenses: Math.round(totalExpenses),
    appreciationGain: Math.round(totalAppreciation),
    breakevenYear: breakevenYear,
    recommendation: recommendation,
    holdingPeriod: holdingPeriod
  }
}

function generateRecommendation(diff, sellWealth, rentWealth, breakevenYear, holdingPeriod) {
  const formattedDiff = Math.abs(Math.round(diff)).toLocaleString()
  const formattedSell = Math.round(sellWealth).toLocaleString()
  const formattedRent = Math.round(rentWealth).toLocaleString()
  
  if (diff > 0) {
    if (breakevenYear && breakevenYear <= holdingPeriod) {
      return `✅ Renting is better! You'll break even in ${breakevenYear} year${breakevenYear > 1 ? 's' : ''} and come out $${formattedDiff} ahead over ${holdingPeriod} years.`
    }
    return `✅ Renting is the better strategy. You'll build $${formattedDiff} more wealth by renting and selling later.`
  } else if (diff < 0) {
    if (breakevenYear && breakevenYear > holdingPeriod) {
      return `💰 Selling now is better in the short term. However, if you can hold for ${breakevenYear} years, renting would become more profitable.`
    }
    return `💰 Selling now is your best move. You'll walk away with $${formattedSell} today versus $${formattedRent} if you rent for ${holdingPeriod} years.`
  } else {
    return `📊 Both options yield similar wealth over ${holdingPeriod} years. Consider your personal goals.`
  }
}