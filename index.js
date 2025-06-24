const axios = require('axios');

// Jupiter API configuration
const TOKENS = [
  { name: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
  { name: 'WBTC', mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh' },
  { name: 'ETH', mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs' }
];

const HEADERS = {
  'accept': '*/*',
  'accept-language': 'en-US,en;q=0.9',
  'content-type': 'application/json',
  'referrer': 'https://www.jup.ag/',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function checkLatestVolume() {
  console.log('🔍 Checking latest Jupiter perps volume from API...\n');
  
  const results = [];
  
  for (const token of TOKENS) {
    try {
      const url = `https://perps-api.jup.ag/v1/market-stats?mint=${token.mint}`;
      console.log(`📡 Fetching ${token.name}...`);
      
      const response = await axios.get(url, { headers: HEADERS });
      
      // Extract volume and convert to number
      const data = response.data;
      const volumeStr = data?.volume || 
                       data?.volume24h || 
                       data?.dailyVolume || 
                       data?.stats?.volume24h ||
                       data?.stats?.dailyVolume ||
                       data?.data?.volume24h ||
                       '0';
      
      const volume = parseFloat(volumeStr);
      
      console.log(`  💰 ${token.name} Volume: ${volume.toLocaleString()}`);
      
      results.push({
        token: token.name,
        mint: token.mint,
        volume: volume,
        rawData: data
      });
      
      // Small delay to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error fetching ${token.name}:`, error.message);
      console.error('Full error:', error);
      results.push({
        token: token.name,
        mint: token.mint,
        volume: 0,
        error: error.message
      });
    }
  }
  
  // Calculate totals (now properly as numbers)
  const totalVolume = results.reduce((sum, r) => sum + (r.volume || 0), 0);
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    if (result.error) {
      console.log(`${result.token}: ERROR - ${result.error}`);
    } else {
      console.log(`${result.token}: ${result.volume.toLocaleString()}`);
    }
  });
  
  console.log('-'.repeat(50));
  console.log(`🎯 TOTAL: ${totalVolume.toLocaleString()}`);
  console.log(`💵 In Millions: ${(totalVolume / 1000000).toFixed(2)}M`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  
  // Compare with your JSON file value
  const jsonVolume = 444153701;
  const difference = totalVolume - jsonVolume;
  const percentDiff = totalVolume > 0 ? ((difference / jsonVolume) * 100).toFixed(2) : 'N/A';
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 COMPARISON WITH JSON:');
  console.log('='.repeat(50));
  console.log(`JSON (2025-06-24): ${jsonVolume.toLocaleString()}`);
  console.log(`API (current):     ${totalVolume.toLocaleString()}`);
  console.log(`Difference:        ${difference.toLocaleString()} (${percentDiff}%)`);
  
  if (Math.abs(difference) < 50000000) { // Within 50M
    console.log('✅ Values are reasonably close');
  } else {
    console.log('⚠️  Significant difference detected');
  }
  
  console.log('\n🔍 API Field Structure:');
  console.log('The API returns volume in the "volume" field as a string');
  console.log('Make sure your GitHub workflow converts this to number properly');
  
  // Show one sample API response
  if (results.length > 0 && results[0].rawData) {
    console.log('\n📋 Sample API Response (SOL):');
    console.log(JSON.stringify(results[0].rawData, null, 2));
  }
}

// Add error handling for the main execution
console.log('🚀 Starting Jupiter API check...');

checkLatestVolume()
  .then(() => {
    console.log('\n✅ Script completed successfully');
  })
  .catch(error => {
    console.error('\n💥 Script failed with error:');
    console.error(error);
    process.exit(1);
  });