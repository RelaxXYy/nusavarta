import { Router, Request, Response } from 'express';
import { getAiResponse, getCulturalRouteDecision } from '../services/gemini.service';
import { getDirectionsWithWaypoints } from '../services/maps.service';

const router = Router();

// "Memori" sederhana untuk menyimpan konteks percakapan.
// Untuk produksi, gunakan database seperti Redis.
const userContexts: { [userId: string]: any } = {};

router.post('/chat', async (req: Request, res: Response) => {
    const { message, userId = 'defaultUser' } = req.body;
    if (!message) return res.status(400).json({ reply: 'Pesan tidak boleh kosong.' });

    try {
        const context = userContexts[userId];
        const lowerCaseMessage = message.toLowerCase();

        // Alur 2: Merespons konfirmasi pengguna
        if (context && context.awaitingConfirmation) {
        const wantsCulture = ['ya', 'mau', 'boleh', 'tertarik', 'tentu'].some(word => lowerCaseMessage.includes(word));
        const routeData = await getDirectionsWithWaypoints(context.origin, context.destination, wantsCulture);
        delete userContexts[userId]; // Hapus konteks setelah selesai
        return res.json({ routeData });
        }

        // Alur 1: Mendeteksi permintaan rute baru
        const routeDecision = await getCulturalRouteDecision(message);
        if (routeDecision.isRouteRequest) {
        userContexts[userId] = {
            awaitingConfirmation: true,
            origin: routeDecision.origin,
            destination: routeDecision.destination,
        };
        return res.json({ reply: routeDecision.aiReply });
        }
        
        // Alur 3: Jawaban AI biasa
        const reply = await getAiResponse(message);
        return res.json({ reply });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ reply: 'Aduh, terjadi kesalahan di pusat data saya.' });
    }
});

export default router;