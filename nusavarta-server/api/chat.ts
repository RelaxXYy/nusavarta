import { VercelRequest, VercelResponse } from '@vercel/node';

// Cultural data for Indonesia
const culturalData = {
    landmarks: [
        {
            id: 'gedung-sate',
            name: 'Gedung Sate',
            description: 'Gedung Sate adalah ikon Kota Bandung yang dibangun pada masa kolonial Belanda. Dinamakan Gedung Sate karena bentuk menara yang menyerupai tusuk sate.',
            location: 'Bandung, Jawa Barat',
            significance: 'Pusat pemerintahan dan arsitektur Art Deco'
        },
        {
            id: 'borobudur',
            name: 'Candi Borobudur',
            description: 'Candi Buddha terbesar di dunia yang dibangun pada abad ke-8-9. Merupakan warisan dunia UNESCO.',
            location: 'Magelang, Jawa Tengah',
            significance: 'Warisan budaya Buddha dan arsitektur kuno'
        },
        {
            id: 'prambanan',
            name: 'Candi Prambanan',
            description: 'Kompleks candi Hindu terbesar di Indonesia yang didedikasikan untuk Trimurti.',
            location: 'Yogyakarta, Jawa Tengah',
            significance: 'Warisan budaya Hindu dan seni relief'
        }
    ],
    cultures: [
        {
            id: 'batik',
            name: 'Batik',
            description: 'Seni membuat kain dengan teknik resist wax yang telah diakui UNESCO.',
            origin: 'Jawa',
            significance: 'Warisan budaya tak benda dunia'
        },
        {
            id: 'wayang',
            name: 'Wayang',
            description: 'Seni pertunjukan tradisional Indonesia menggunakan boneka kulit.',
            origin: 'Jawa',
            significance: 'Media pendidikan dan hiburan tradisional'
        }
    ]
};

// Simple AI response generator
function generateAIResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific landmarks
    if (lowerMessage.includes('gedung sate')) {
        const gedungSate = culturalData.landmarks.find(l => l.id === 'gedung-sate');
        return `🏛️ ${gedungSate?.description} Gedung ini terletak di ${gedungSate?.location} dan merupakan ${gedungSate?.significance}. Apakah Anda ingin tahu lebih banyak tentang sejarah arsitektur kolonial Bandung?`;
    }
    
    if (lowerMessage.includes('borobudur')) {
        const borobudur = culturalData.landmarks.find(l => l.id === 'borobudur');
        return `🕌 ${borobudur?.description} Candi ini berlokasi di ${borobudur?.location} dan memiliki makna sebagai ${borobudur?.significance}. Tahukah Anda bahwa Borobudur memiliki 2.672 panel relief dan 504 arca Buddha?`;
    }
    
    if (lowerMessage.includes('prambanan')) {
        const prambanan = culturalData.landmarks.find(l => l.id === 'prambanan');
        return `🛕 ${prambanan?.description} Terletak di ${prambanan?.location}, candi ini terkenal karena ${prambanan?.significance}. Kompleks ini terdiri dari 240 candi dengan 3 candi utama untuk Brahma, Wisnu, dan Siwa.`;
    }
    
    if (lowerMessage.includes('batik')) {
        const batik = culturalData.cultures.find(c => c.id === 'batik');
        return `🎨 ${batik?.description} Batik berasal dari ${batik?.origin} dan diakui sebagai ${batik?.significance}. Setiap motif batik memiliki makna filosofis yang mendalam!`;
    }
    
    if (lowerMessage.includes('wayang')) {
        const wayang = culturalData.cultures.find(c => c.id === 'wayang');
        return `🎭 ${wayang?.description} Seni ini berasal dari ${wayang?.origin} dan berfungsi sebagai ${wayang?.significance}. Pertunjukan wayang bisa berlangsung semalam suntuk!`;
    }
    
    // Check for route/direction requests
    if (lowerMessage.includes('rute') || lowerMessage.includes('jalan') || lowerMessage.includes('ke ') || lowerMessage.includes('dari ')) {
        return `🗺️ Saya dapat membantu Anda menemukan rute ke tempat-tempat bersejarah! Untuk saat ini, saya bisa memberikan informasi tentang Gedung Sate, Borobudur, Prambanan, dan tempat wisata budaya lainnya. Ke mana Anda ingin pergi?`;
    }
    
    // Greeting responses
    if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
        return `🙏 Halo! Saya Garudie, pemandu wisata digital Indonesia. Saya siap membantu Anda menjelajahi kekayaan budaya Nusantara! Anda bisa bertanya tentang tempat bersejarah, budaya tradisional, atau rute perjalanan. Ada yang ingin Anda ketahui?`;
    }
    
    // Default response
    return `🌟 Terima kasih atas pertanyaan Anda: "${message}". Sebagai pemandu wisata digital, saya dapat membantu Anda dengan informasi tentang tempat bersejarah Indonesia seperti Gedung Sate, Borobudur, Prambanan, serta budaya tradisional seperti batik dan wayang. Silakan tanyakan hal spesifik yang ingin Anda ketahui!`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    // CORS headers
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
            receivedMethod: req.method,
            usage: 'Send POST request with {"message": "your question"}'
        });
    }

    try {
        const { message, userId = 'defaultUser' } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Pesan tidak boleh kosong dan harus berupa string.',
                example: '{"message": "Ceritakan tentang Gedung Sate"}',
                received: { message, type: typeof message }
            });
        }

        // Generate AI response based on message content
        const reply = generateAIResponse(message);
        
        res.status(200).json({ 
            reply,
            timestamp: new Date().toISOString(),
            userId,
            status: 'success',
            messageLength: message.length
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            error: 'Terjadi kesalahan pada server',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}