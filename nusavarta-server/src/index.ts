import express from 'express';
import cors from 'cors';
import { VercelRequest, VercelResponse } from '@vercel/node';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Server AI Garudie berjalan!', 
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Simple response for testing
        const response = `Halo! Anda mengatakan: "${message}". Ini adalah respons dari server Nusavarta.`;
        
        res.json({ reply: response });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export for Vercel
export default app;

// For local development only
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}