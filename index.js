const fs = require('fs');
const csv = require('csv-parser');

function parseCSVDate(dateStr) {
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function convertCSVToJSON() {
  const data = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('perps_daily_volume.csv')
      .pipe(csv())
      .on('data', (row) => {
        const isoDate = parseCSVDate(row.Date);
        data.push({
          date: isoDate,
          volume: parseInt(row.Volume)
        });
      })
      .on('end', () => {
        // Sort by date (newest first)
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const jsonOutput = {
          data: data,
          lastUpdated: new Date().toISOString(),
          totalRecords: data.length
        };
        
        fs.writeFileSync('perps_daily_volume.json', JSON.stringify(jsonOutput, null, 2));
        console.log(`✅ Converted ${data.length} records to JSON`);
        console.log(`📅 Date range: ${data[data.length-1].date} to ${data[0].date}`);
        
        resolve(jsonOutput);
      })
      .on('error', reject);
  });
}

// Run conversion
convertCSVToJSON().catch(console.error);