import { Actor } from 'apify';

await Actor.init();

const input = await Actor.getInput();
const { address, zipCode } = input || {};

// Property estimates by zip code
const zipEstimates = {
    '30004': 550000,   // Alpharetta, GA
    '30005': 600000,   // Alpharetta, GA
    '30022': 500000,   // Alpharetta/Johns Creek, GA
    '30024': 480000,   // Suwanee, GA
    '78701': 650000,   // Austin, TX
    '78702': 450000,   // Austin, TX
    '78703': 850000,   // Austin, TX
    '78704': 600000,   // Austin, TX
    '90210': 2500000,  // Beverly Hills, CA
    '94102': 1200000,  // San Francisco, CA
    '10001': 1100000,  // New York, NY
    '11201': 850000,   // Brooklyn, NY
    '33101': 450000,   // Miami, FL
    '32801': 375000,   // Orlando, FL
    '75201': 550000,   // Dallas, TX
    '77001': 350000,   // Houston, TX
    '60601': 450000,   // Chicago, IL
    '98101': 700000,   // Seattle, WA
    '80201': 500000,   // Denver, CO
    '85001': 400000,   // Phoenix, AZ
    'default': 400000
};

const estimatedValue = zipEstimates[zipCode] || zipEstimates['default'];
const estimatedRent = Math.round(estimatedValue * 0.006);
const estimatedMortgage = Math.round(estimatedValue * 0.004);

await Actor.pushData({
    success: true,
    address: address || 'Unknown',
    zipCode: zipCode || 'Unknown',
    estimatedValue: estimatedValue,
    estimatedRent: estimatedRent,
    estimatedMortgage: estimatedMortgage,
    propertyType: 'Single Family',
    timestamp: new Date().toISOString()
});

console.log(`✅ Property data for ${address}: $${estimatedValue.toLocaleString()}`);

await Actor.exit();