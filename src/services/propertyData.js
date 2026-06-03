// src/services/propertyData.js
// Uses Apify REST API directly - works in browser!

const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
const ACTOR_ID = 'PO5rg9zAiPhq2Ywcj';

const cache = new Map();

export async function getPropertyData(address, zipCode) {
    const cacheKey = `${address}-${zipCode}`;
    
    // Check cache (24 hours)
    if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
            console.log('✅ Using cached property data');
            return cached.data;
        }
    }
    
    try {
        console.log(`🔄 Fetching property data from Apify for: ${address}`);
        
        // Step 1: Start the Actor run
        const runResponse = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                address: address,
                zipCode: zipCode || 'unknown'
            })
        });
        
        const runData = await runResponse.json();
        const runId = runData.data.id;
        
        console.log(`Actor run started with ID: ${runId}`);
        
        // Step 2: Wait for the run to complete (poll every 2 seconds)
        let runStatus = 'RUNNING';
        let attempts = 0;
        const maxAttempts = 30; // 60 seconds max wait
        
        while (runStatus === 'RUNNING' && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
                headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
            });
            const statusData = await statusResponse.json();
            runStatus = statusData.data.status;
            attempts++;
            console.log(`Run status: ${runStatus} (attempt ${attempts})`);
        }
        
        if (runStatus !== 'SUCCEEDED') {
            throw new Error(`Actor run failed with status: ${runStatus}`);
        }
        
        // Step 3: Get the results
        const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
            headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
        });
        const items = await datasetResponse.json();
        
        if (items && items.length > 0) {
            const property = items[0];
            const result = {
                address: property.address,
                estimatedValue: property.estimatedValue || 400000,
                estimatedRent: property.estimatedRent || Math.round(property.estimatedValue * 0.006),
                estimatedMortgage: property.estimatedMortgage || Math.round(property.estimatedValue * 0.004),
                propertyType: property.propertyType || 'Single Family',
                source: 'Apify API'
            };
            
            cache.set(cacheKey, { data: result, timestamp: Date.now() });
            console.log(`✅ Property data received: $${result.estimatedValue.toLocaleString()}`);
            return result;
        }
        
        return getFallbackData(address);
        
    } catch (error) {
        console.error('❌ Apify API error:', error);
        return getFallbackData(address);
    }
}

function getFallbackData(address) {
    return {
        address: address,
        estimatedValue: 400000,
        estimatedRent: 2000,
        estimatedMortgage: 1600,
        propertyType: 'Single Family',
        source: 'Fallback Estimate',
        isEstimated: true
    };
}