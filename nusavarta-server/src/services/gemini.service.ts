import { GoogleGenerativeAI } from '@google/generative-ai';
import { database } from '../data/culturalData';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Fungsi untuk menjawab pertanyaan umum berbasis data
export async function getAiResponse(query: string): Promise<string> {
    const context = database
        .filter(item => query.toLowerCase().includes(item.name.toLowerCase()))
        .map(item => `Nama: ${item.name}\nDeskripsi: ${item.description}`)
        .join('\n\n') || 'Tidak ada konteks spesifik dari database.';

    const prompt = `Anda adalah "Garudie", AI pemandu wisata dari aplikasi "Nusavarta". Persona Anda ramah, antusias, dan berpengetahuan. Selalu jawab dalam Bahasa Indonesia. Gunakan konteks berikut untuk jawaban yang akurat.
    Konteks: ${context}
    Pertanyaan: "${query}"
    Jawaban Garudie:`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        return "Aduh, maaf! Sepertinya saya sedang butuh istirahat sejenak. Boleh coba lagi?";
    }
}

// Fungsi untuk mendeteksi permintaan rute & bertanya balik
export async function getCulturalRouteDecision(query: string): Promise<{ isRouteRequest: boolean; origin: string; destination: string; aiReply: string; }> {
    const prompt = `Analisis pertanyaan pengguna ini. Tentukan apakah ini permintaan rute. Jika ya, ekstrak lokasi AWAL dan TUJUAN, lalu buat pertanyaan balik yang ramah untuk menawarkan tur budaya. Jawab HANYA dalam format JSON.
    Contoh Pertanyaan: "Gimana cara ke Gedung Sate dari Stasiun Bandung?"
    Jawaban JSON yang Diharapkan:
    { "isRouteRequest": true, "origin": "Stasiun Bandung", "destination": "Gedung Sate", "aiReply": "Tentu! Perjalanan ke Gedung Sate akan lebih seru kalau mampir ke tempat bersejarah di sekitarnya. Apakah Anda tertarik untuk sekalian saya buatkan rute budaya?" }
    
    Pertanyaan Pengguna: "${query}"
    Jawaban JSON:`;

    try {
        const result = await model.generateContent(prompt);
        const jsonString = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        // Jika gagal, anggap bukan permintaan rute
        return { isRouteRequest: false, origin: '', destination: '', aiReply: '' };
    }
}