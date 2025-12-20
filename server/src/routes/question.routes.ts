import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Question from '../models/Question';
import * as aiService from '../services/aiService';
import Video from '../models/Video';

const router = express.Router();

// GET /api/videos/:id/questions
router.get('/:videoId/questions', authenticateToken as any, async (req, res) => {
    try {
        const questions = await Question.find({ videoId: req.params.videoId });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/videos/:id/questions/regenerate
router.post('/:videoId/questions/regenerate', authenticateToken as any, async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const { type, difficulty, language } = req.body;
        const newQuestions = await aiService.generateQuestions(video.transcript, type, difficulty, language, 5);

        const savedQuestions = await Promise.all(
            newQuestions.map((q: any) => new Question({ ...q, videoId: video._id }).save())
        );

        res.status(201).json(savedQuestions);
    } catch (error) {
        res.status(500).json({ message: 'Regeneration failed' });
    }
});

// PUT /api/questions/:id
router.put('/:id', authenticateToken as any, async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// DELETE /api/questions/:id
router.delete('/:id', authenticateToken as any, async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Deletion failed' });
    }
});

export default router;
