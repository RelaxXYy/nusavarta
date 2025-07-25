import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRouter from './routes/chat.router';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server AI Garudie berjalan!');
});

app.use('/api', chatRouter);

app.listen(port, () => {
    console.log(`[server]: Server AI Garudie aktif di http://localhost:${port}`);
});