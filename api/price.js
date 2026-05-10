// Vercel Serverless Function - Live Price Proxy
// File: api/price.js
// Uses Node.js https module - most compatible with all Vercel runtimes

var https = require(‘https’);

module.exports = function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘GET, OPTIONS’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

var ticker = req.query.ticker;
if (!ticker) {
return res.status(400).json({ error: ‘Missing ticker’ });
}

var apiKey = process.env.API_KEY;
if (!apiKey) {
return res.status(500).json({ error: ‘API_KEY not configured’ });
}

var options = {
hostname: ‘api.financialdatasets.ai’,
path: ‘/prices/snapshot?ticker=’ + encodeURIComponent(ticker),
method: ‘GET’,
headers: {
‘X-API-KEY’: apiKey,
‘Accept’: ‘application/json’
}
};

var request = https.request(options, function(response) {
var body = ‘’;
response.on(‘data’, function(chunk) { body += chunk; });
response.on(‘end’, function() {
try {
var data = JSON.parse(body);
var price = null;
if (data.snapshot) {
price = data.snapshot.price || data.snapshot.close || data.snapshot.last_price;
} else if (typeof data.price === ‘number’) {
price = data.price;
} else if (data.close) {
price = data.close;
}
res.status(200).json({
ticker: ticker,
price: price,
status: response.statusCode,
timestamp: new Date().toISOString()
});
} catch (e) {
res.status(500).json({ error: ’Parse error: ’ + e.message, body: body });
}
});
});

request.on(‘error’, function(e) {
res.status(500).json({ error: e.message });
});

request.end();
};