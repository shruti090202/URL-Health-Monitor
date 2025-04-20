const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Server is running' });
});

// URL checking endpoint
app.post('/api/check-urls', async (req, res) => {
    try {
        const { urls } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of URLs' });
        }
        
        const results = await Promise.all(urls.map(checkUrl));
        res.json(results);
    } catch (error) {
        console.error('Error checking URLs:', error);
        res.status(500).json({ error: 'Failed to check URLs' });
    }
});

// Function to check a single URL
async function checkUrl(url) {
    // Ensure URL has http/https prefix
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url;
    }
    
    const timestamp = Date.now();
    const startTime = process.hrtime();
    
    try {
        const response = await axios.get(formattedUrl, {
            timeout: 5000, // 5 second timeout
            maxRedirects: 5,
            validateStatus: null, // Don't reject on any status code
        });
        
        const endTime = process.hrtime(startTime);
        const responseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
        
        return {
            url: url,
            status: response.status < 400 ? 'UP' : 'DOWN',
            statusCode: response.status,
            responseTime: responseTimeMs,
            timestamp: timestamp
        };
    } catch (error) {
        const endTime = process.hrtime(startTime);
        const responseTimeMs = Math.round((endTime[0] * 1000) + (endTime[1] / 1000000));
        
        return {
            url: url,
            status: 'DOWN',
            statusCode: error.response?.status || 0,
            error: error.code || 'UNKNOWN_ERROR',
            responseTime: responseTimeMs,
            timestamp: timestamp
        };
    }
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});