// src/services/propertyData.js
import { supabase } from './supabase';

const APIFY_API_TOKEN = import.meta.env.VITE_APIFY_API_TOKEN;
const ACTOR_ID = 'PO5rg9zAiPhq2Ywcj';

// Simple hash for address matching
function simpleHash(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 100);
}

export async function getPropertyData(address, zipCode) {
    const addressHash = simpleHash(address);
    
    // STEP 1: Check Supabase cache FIRST
    console.log(`🔍 Checking cache for: ${address}`);
    
    try {
        const { data: cached, error } = await supabase
            .from('property_cache')
            .select('*')
            .eq('address_hash', addressHash)
            .maybeSingle();
        
        if (cached && !error) {
            console.log(`✅ CACHE HIT! Value: $${cached.estimated_value.toLocaleString()}`);
            
            // Update access count
            await supabase
                .from('property_cache')
                .update({ 
                    last_accessed: new Date().toISOString(),
                    times_accessed: (cached.times_accessed || 0) + 1
                })
                .eq('id', cached.id);
            
            return {
                address: cached.address,
                estimatedValue: cached.estimated_value,
                estimatedRent: cached.estimated_rent,
                estimatedMortgage: cached.estimated_mortgage,
                propertyType: cached.property_type || 'Single Family',
                source: `Cache (${cached.source || 'Previous lookup'})`,
                confidence: 'High',
                isCached: true
            };
        }
    } catch (error) {
        console.log('Cache miss or error:', error.message);
    }
    
    // STEP 2: Not in cache - get estimate from Apify
    console.log(`🔄 CACHE MISS! Getting estimate from Apify for: ${address}`);
    
    try {
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
        
        // Wait for completion (max 15 seconds)
        let runStatus = 'RUNNING';
        let attempts = 0;
        while (runStatus === 'RUNNING' && attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
                headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
            });
            const statusData = await statusResponse.json();
            runStatus = statusData.data.status;
            attempts++;
        }
        
        // Get results
        const datasetResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`, {
            headers: { 'Authorization': `Bearer ${APIFY_API_TOKEN}` }
        });
        const items = await datasetResponse.json();
        
        if (items && items.length > 0) {
            const property = items[0];
            const result = {
                address: address,
                estimatedValue: property.estimatedValue,
                estimatedRent: property.estimatedRent,
                estimatedMortgage: property.estimatedMortgage,
                propertyType: property.propertyType || 'Single Family',
                source: property.source || 'Apify Estimate',
                confidence: property.confidenceNote || 'Standard'
            };
            
            // STEP 3: SAVE to Supabase for future users!
            await saveToCache(address, zipCode, addressHash, result);
            
            return result;
        }
    } catch (error) {
        console.error('Apify error:', error);
    }
    
    // STEP 4: Ultimate fallback
    return getFallbackData(address);
}

async function saveToCache(address, zipCode, addressHash, data) {
    try {
        const { error } = await supabase
            .from('property_cache')
            .upsert({
                address: address,
                address_hash: addressHash,
                zip_code: zipCode,
                estimated_value: data.estimatedValue,
                estimated_rent: data.estimatedRent,
                estimated_mortgage: data.estimatedMortgage,
                property_type: data.propertyType,
                source: data.source,
                confidence: data.confidence,
                created_at: new Date().toISOString(),
                last_accessed: new Date().toISOString(),
                times_accessed: 1
            }, {
                onConflict: 'address_hash'
            });
        
        if (error) {
            console.error('Save to cache error:', error);
        } else {
            console.log(`💾 Saved to cache! Future users will get instant results.`);
        }
    } catch (error) {
        console.error('Save error:', error);
    }
}

function getFallbackData(address) {
    return {
        address: address,
        estimatedValue: 400000,
        estimatedRent: 2000,
        estimatedMortgage: 1600,
        propertyType: 'Single Family',
        source: 'Standard Estimate',
        confidence: 'Low',
        isFallback: true
    };
}