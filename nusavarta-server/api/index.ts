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

    res.status(200).json({ 
        message: 'Server AI Garudie berjalan!', 
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/',
            chat: '/api/chat',
            test: '/api/test'
        },
        version: '2.0.0'
    });
}