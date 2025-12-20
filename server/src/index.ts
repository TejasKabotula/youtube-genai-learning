import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import videoRoutes from './routes/video.routes';
import questionRoutes from './routes/question.routes';
import clarificationRoutes from './routes/clarification.routes';
import reportRoutes from './routes/report.routes';

// Wait, fix the import extension if needed. Using .js for ESM compatibility with NodeNext.
// Wait, I used NodeNext in tsconfig. For ts-node-dev it usually works fine but let's be careful.

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-tutor';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/videos', clarificationRoutes); // /api/videos/:id/clarifications...
app.use('/api/videos', reportRoutes); // /api/videos/:id/report/...
app.use('/api/videos', videoRoutes); // Base video routes

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });
