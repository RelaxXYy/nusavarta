import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST'],
            receivedMethod: req.method
        });
    }

    try {
        const { message, userId = 'defaultUser' } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                error: 'Pesan tidak boleh kosong.',
                example: '{"message": "Hello"}'
            });
        }

        // Simple response for now
        const reply = `Halo! Anda mengatakan: "${message}". Saya Garudie, AI pemandu wisata Indonesia. Saat ini saya dalam mode sederhana untuk testing.`;
        
        res.status(200).json({ 
            reply,
            timestamp: new Date().toISOString(),
            userId,
            status: 'success'
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}