import { Router } from 'express';
import { getStoryPlaces, type StoryPlace } from '../services/firestoreService.js';

const router = Router();

router.get('/story-places', async (req, res) => {
    try {
        const places = await getStoryPlaces();

        // Mengelompokkan data berdasarkan kategori dengan explicit typing
        const groupedPlaces = {
            landmarks: places.filter((p: StoryPlace) => p.category === 'landmark'),
            cultures: places.filter((p: StoryPlace) => p.category === 'culture'),
            museums: places.filter((p: StoryPlace) => p.category === 'museum'),
        };

        res.status(200).json(groupedPlaces);
    } catch (error) {
        console.error('Error fetching story places:', error);
        res.status(500).json({ error: 'Failed to fetch story places' });
    }
});

export default router;