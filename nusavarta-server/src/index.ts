import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRouter from './routes/chat.router';
import placesRouter from './routes/places.router';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Server AI Garudie berjalan!', status: 'OK' });
});

app.use('/api', chatRouter);
app.use('/api', placesRouter);

// For Vercel, we need to export the app
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

export default app;