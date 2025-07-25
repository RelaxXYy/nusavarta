import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.json({ 
        message: 'Server AI Garudie berjalan!', 
        status: 'OK',
        timestamp: new Date().toISOString()
    });
}