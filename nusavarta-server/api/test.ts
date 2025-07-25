import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const testData = {
        message: '✅ Test endpoint working perfectly!',
        server: {
            status: 'healthy',
            uptime: process.uptime(),
            nodeVersion: process.version,
            platform: process.platform
        },
        environment: {
            geminiApiKey: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set',
            maptilerApiKey: process.env.MAPTILER_API_KEY ? '✅ Set' : '❌ Not set',
            nodeEnv: process.env.NODE_ENV || 'development'
        },
        endpoints: {
            health: '/api/',
            chat: '/api/chat',
            test: '/api/test'
        },
        timestamp: new Date().toISOString()
    };
    
    res.status(200).json(testData);
}