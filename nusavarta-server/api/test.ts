import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const testData = {
        message: 'Test endpoint working!',
        environment: {
            geminiApiKey: process.env.GEMINI_API_KEY ? 'Set' : 'Not set',
            maptilerApiKey: process.env.MAPTILER_API_KEY ? 'Set' : 'Not set'
        },
        timestamp: new Date().toISOString()
    };
    
    res.status(200).json(testData);
}