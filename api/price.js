// Vercel Serverless Function - Live Price Proxy
// Place this file at: /api/price.js in your GitHub repo
// Vercel automatically deploys this as a backend endpoint

export default async function handler(req, res) {
// CORS headers so your bot can call this from anywhere
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET’);

const ticker = req.query.ticker;
if (!ticker) {
return res.status(400).json({ error: ‘Missing ticker parameter’ });
}

const apiKey = process.env.API_KEY;
if (!apiKey) {
return res.status(500).json({ error: ‘API key not configured on server’ });
}

try {
// Call financialdatasets.ai for live price
const response = await fetch(
`https://api.financialdatasets.ai/prices/snapshot?ticker=${ticker}`,
{
headers: {
‘X-API-KEY’: apiKey,
‘Accept’: ‘application/json’
}
}
);

```
if (!response.ok) {
  return res.status(response.status).json({
    error: `API error: ${response.status}`,
    ticker: ticker
  });
}

const data = await response.json();

// Return clean price data
const snapshot = data.snapshot || data.price || data;
return res.status(200).json({
  ticker: ticker,
  price: snapshot.price || snapshot.close || snapshot.last_price,
  change: snapshot.day_change || snapshot.change,
  changePercent: snapshot.day_change_percent || snapshot.change_percent,
  volume: snapshot.volume,
  timestamp: new Date().toISOString()
});
```

} catch (err) {
return res.status(500).json({
error: err.message,
ticker: ticker
});
}
}