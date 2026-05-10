// Vercel Serverless Function - Live Price Proxy
// File: api/price.js
// Uses CommonJS format - works without package.json module config

module.exports = async function handler(req, res) {
// CORS headers
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

// Handle preflight
if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

var ticker = req.query.ticker;
if (!ticker) {
return res.status(400).json({ error: ‘Missing ticker’ });
}

var apiKey = process.env.API_KEY;
if (!apiKey) {
return res.status(500).json({ error: ‘API_KEY not set in Vercel environment variables’ });
}

try {
var response = await fetch(
‘https://api.financialdatasets.ai/prices/snapshot?ticker=’ + ticker,
{
headers: {
‘X-API-KEY’: apiKey,
‘Accept’: ‘application/json’
}
}
);

```
var text = await response.text();

if (!response.ok) {
  return res.status(response.status).json({
    error: 'API returned ' + response.status,
    body: text,
    ticker: ticker
  });
}

var data = JSON.parse(text);

// Handle different response shapes from financialdatasets.ai
var price = null;
if (data.snapshot) {
  price = data.snapshot.price || data.snapshot.close || data.snapshot.last_price;
} else if (data.price) {
  price = typeof data.price === 'number' ? data.price : data.price.price;
} else if (data.close) {
  price = data.close;
}

return res.status(200).json({
  ticker: ticker,
  price: price,
  raw: data,
  timestamp: new Date().toISOString()
});
```

} catch (err) {
return res.status(500).json({
error: err.message,
ticker: ticker
});
}
};