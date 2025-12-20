import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Clarification from '../models/Clarification';
import Doubt from '../models/Doubt';
import Video from '../models/Video';
import * as aiService from '../services/aiService';

const router = express.Router();

// GET /api/videos/:id/clarifications
router.get('/:videoId/clarifications', authenticateToken as any, async (req, res) => {
    try {
        const clarifications = await Clarification.find({ videoId: req.params.videoId });
        res.json(clarifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/videos/:id/clarifications/ask
router.post('/:videoId/clarifications/ask', authenticateToken as any, async (req: AuthRequest, res) => {
    try {
        const { question } = req.body;
        const userId = req.user?.id;
        const video = await Video.findById(req.params.videoId);

        if (!video) return res.status(404).json({ message: 'Video not found' });

        // RAG-style: in a complex app, we'd use vector search. 
        // Here we'll just use the first few words or the whole transcript if short.
        const transcriptChunk = video.transcript.slice(0, 5000);
        const aiResponse = await aiService.answerUserDoubt(transcriptChunk, question, video.language);

        const doubt = new Doubt({
            videoId: video._id,
            userId,
            question,
            answer: aiResponse.answer
        });

        await doubt.save();
        res.status(201).json(doubt);
    } catch (error) {
        res.status(500).json({ message: 'Failed to answer doubt' });
    }
});

// GET /api/videos/:id/doubts
router.get('/:videoId/doubts', authenticateToken as any, async (req: AuthRequest, res) => {
    try {
        const doubts = await Doubt.find({ videoId: req.params.videoId, userId: req.user?.id });
        res.json(doubts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
