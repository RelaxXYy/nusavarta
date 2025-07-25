import { VercelRequest, VercelResponse } from '@vercel/node';
import { getAiResponse, getCulturalRouteDecision } from '../src/services/gemini.service';
import { getDirectionsWithWaypoints } from '../src/services/maps.service';

// Simple in-memory storage for user contexts (for demo purposes)
const userContexts: { [userId: string]: any } = {};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, userId = 'defaultUser' } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
        }

        const context = userContexts[userId];
        const lowerCaseMessage = message.toLowerCase();

        // Alur 2: Merespons konfirmasi pengguna
        if (context && context.awaitingConfirmation) {
            const wantsCulture = ['ya', 'mau', 'boleh', 'tertarik', 'tentu'].some(word => lowerCaseMessage.includes(word));
            const routeData = await getDirectionsWithWaypoints(context.origin, context.destination, wantsCulture);
            delete userContexts[userId]; // Hapus konteks setelah selesai
            return res.status(200).json({ routeData });
        }

        // Alur 1: Mendeteksi permintaan rute baru
        const routeDecision = await getCulturalRouteDecision(message);
        if (routeDecision.isRouteRequest) {
            userContexts[userId] = {
                awaitingConfirmation: true,
                origin: routeDecision.origin,
                destination: routeDecision.destination,
            };
            return res.status(200).json({ reply: routeDecision.aiReply });
        }
        
        // Alur 3: Jawaban AI biasa menggunakan Gemini
        const reply = await getAiResponse(message);
        return res.status(200).json({ reply });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Aduh, terjadi kesalahan di pusat data saya.' });
    }
}