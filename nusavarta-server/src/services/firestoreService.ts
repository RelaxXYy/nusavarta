import * as admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // For production, use environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // For development, use the file
      const serviceAccountPath = path.join(__dirname, '../../garudahacks-6-firebase-adminsdk-fbsvc-f5ea5ed076.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();

export interface StoryPlace {
  id: string;
  name: string;
  category: 'landmark' | 'culture' | 'museum';
  description: string;
  imageUrl?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export async function getStoryPlaces(): Promise<StoryPlace[]> {
  try {
    const snapshot = await db.collection('storyPlaces').get();
    const places: StoryPlace[] = [];
    
    snapshot.forEach(doc => {
      places.push({
        id: doc.id,
        ...doc.data()
      } as StoryPlace);
    });
    
    return places;
  } catch (error) {
    console.error('Error fetching story places:', error);
    return [];
  }
}