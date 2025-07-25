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
    res.send('Server AI Garudie berjalan!');
});

app.use('/api', chatRouter);
app.use('/api', placesRouter);

export default app;