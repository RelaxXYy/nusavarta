/**
 * Nusavarta AI - Firebase Functions Backend
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import cors from "cors";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// CORS setup
const corsHandler = cors({origin: true});

// Set global options
setGlobalOptions({maxInstances: 10});

// Types
interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: admin.firestore.Timestamp;
  userId?: string;
}

interface StoryPlace {
  id: string;
  title: string;
  location: string;
  image: string;
  description: string;
  category: "landmark" | "culture" | "museum" | "temple";
}

/**
 * Generate AI response for cultural tourism
 * @param {string} message - User message
 * @return {string} AI response
 */
function generateAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("gedung sate")) {
    return "🏛️ Gedung Sate adalah ikon Kota Bandung yang dibangun " +
           "pada masa kolonial Belanda tahun 1920. Dinamakan Gedung " +
           "Sate karena bentuk menara yang menyerupai tusuk sate.";
  }

  if (lowerMessage.includes("borobudur")) {
    return "🕌 Candi Buddha terbesar di dunia yang dibangun pada " +
           "abad ke-8-9. Merupakan warisan dunia UNESCO dengan " +
           "2.672 panel relief dan 504 arca Buddha.";
  }

  if (lowerMessage.includes("prambanan")) {
    return "🛕 Kompleks candi Hindu terbesar di Indonesia yang " +
           "dibangun pada abad ke-9. Terdiri dari 240 candi dengan " +
           "3 candi utama untuk Trimurti.";
  }

  if (lowerMessage.includes("batik")) {
    return "🎨 Seni membuat kain dengan teknik resist wax yang " +
           "telah diakui UNESCO sebagai Warisan Budaya Tak Benda Dunia.";
  }

  if (lowerMessage.includes("wayang")) {
    return "🎭 Seni pertunjukan tradisional Indonesia menggunakan " +
           "boneka kulit yang dimainkan oleh dalang.";
  }

  if (lowerMessage.includes("halo") || lowerMessage.includes("hai")) {
    return "🙏 Halo! Saya Garudie, pemandu wisata digital Indonesia. " +
           "Saya siap membantu Anda menjelajahi kekayaan budaya " +
           "Nusantara!";
  }

  return "🌟 Terima kasih atas pertanyaan Anda. Sebagai pemandu " +
         "wisata digital, saya dapat membantu dengan informasi " +
         "tentang tempat bersejarah Indonesia.";
}

/**
 * Save message to Firestore
 * @param {Message} message - Message to save
 * @return {Promise<void>}
 */
async function saveMessage(message: Message): Promise<void> {
  try {
    await db.collection("messages").add(message);
    logger.info(`Message saved: ${message.id}`);
  } catch (error) {
    logger.error("Error saving message:", error);
  }
}

/**
 * Chat endpoint for AI responses
 */
export const chat = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== "POST") {
        response.status(405).json({
          error: "Method not allowed",
          allowedMethods: ["POST"],
        });
        return;
      }

      const {message, userId = "anonymous"} = request.body;

      if (!message || typeof message !== "string") {
        response.status(400).json({
          error: "Pesan tidak boleh kosong dan harus berupa string.",
        });
        return;
      }

      logger.info(`Received message from ${userId}: ${message}`);

      // Save user message
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        text: message,
        sender: "user",
        timestamp: admin.firestore.Timestamp.now(),
        userId,
      };
      await saveMessage(userMessage);

      // Generate AI response
      const reply = generateAIResponse(message);

      // Save AI response
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        text: reply,
        sender: "ai",
        timestamp: admin.firestore.Timestamp.now(),
        userId,
      };
      await saveMessage(aiMessage);

      response.status(200).json({
        reply,
        timestamp: new Date().toISOString(),
        userId,
        messageId: aiMessage.id,
      });
    } catch (error) {
      logger.error("Chat error:", error);
      response.status(500).json({
        error: "Terjadi kesalahan pada server",
      });
    }
  });
});

/**
 * Get story places from Firestore
 */
export const storyPlaces = onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      const category = request.query.category as string;

      let queryRef = db.collection("story_places");

      if (category) {
        queryRef = queryRef.where("category", "==", category) as any;
      }

      const snapshot = await queryRef.get();
      const places: StoryPlace[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        places.push({
          id: doc.id,
          title: data.title || "",
          location: data.location || "",
          image: data.image || "",
          description: data.description || "",
          category: data.category || "landmark",
        });
      });

      // Group by category for home screen
      const landmarks = places.filter((p) => p.category === "landmark");
      const cultures = places.filter((p) => p.category === "culture");
      const museums = places.filter((p) => p.category === "museum");
      const temples = places.filter((p) => p.category === "temple");

      response.status(200).json({
        landmarks,
        cultures,
        museums,
        temples,
        total: places.length,
        allPlaces: places,
      });
    } catch (error) {
      logger.error("Error fetching story places:", error);
      response.status(500).json({
        error: "Terjadi kesalahan saat mengambil data tempat",
      });
    }
  });
});

/**
 * Health check endpoint
 */
export const api = onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.status(200).json({
      message: "Nusavarta AI Server berjalan dengan Firebase!",
      status: "OK",
      timestamp: new Date().toISOString(),
      version: "3.0.0-firebase",
    });
  });
});
