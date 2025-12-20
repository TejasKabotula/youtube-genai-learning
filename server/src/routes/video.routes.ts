import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getTranscript, transcribeLocalVideo, extractVideoId } from '../services/youtubeService';
import * as aiService from '../services/aiService';
import Video from '../models/Video';
import Summary from '../models/Summary';
import Question from '../models/Question';
import Clarification from '../models/Clarification';

const router = express.Router();

// POST /api/videos/analyze
router.post('/analyze', authenticateToken as any, async (req: AuthRequest, res) => {
    try {
        const { sourceType, youtubeUrl, filePath, summaryLevels, questionTypes, difficulty, language } = req.body;
        const userId = req.user?.id;

        let transcript = '';
        let title = 'Untititled Video';
        let thumbnailUrl = '';

        if (sourceType === 'youtube') {
            if (!youtubeUrl) return res.status(400).json({ message: 'YouTube URL is required' });
            const videoId = extractVideoId(youtubeUrl);
            title = `YouTube Video (${videoId})`;
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            transcript = await getTranscript(youtubeUrl);
        } else if (sourceType === 'upload') {
            if (!filePath) return res.status(400).json({ message: 'File path is required' });
            transcript = await transcribeLocalVideo(filePath);
            title = 'Uploaded Video';
        } else {
            return res.status(400).json({ message: 'Invalid source type' });
        }

        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({
                message: 'No transcript could be generated for this video. Please ensure the video has subtitles or captions enabled.'
            });
        }

        // 1. Create Video
        const video = new Video({
            userId,
            sourceType,
            youtubeUrl,
            filePath,
            title,
            thumbnailUrl,
            language,
            transcript
        });

        // 2. AI Processing
        // Extract Topics
        const topics = await aiService.extractTopicsWithTimestamps(transcript);
        video.topics = topics;
        await video.save();

        // Generate Summaries
        const summaryData = await aiService.generateSummaries(transcript, language);
        const summaryPromises = summaryLevels.map((level: 'short' | 'medium' | 'detailed') => {
            return new Summary({ videoId: video._id, level, content: summaryData[level] }).save();
        });

        // Generate Questions
        const questionPromises = questionTypes.map((type: string) => {
            return aiService.generateQuestions(transcript, type, difficulty, language, 10)
                .then(qs => Promise.all(qs.map((q: any) => new Question({ ...q, videoId: video._id }).save())));
        });

        // Detect Ambiguities & Clarify
        const ambiguities = await aiService.detectAmbiguities(transcript);
        const validAmbiguities = Array.isArray(ambiguities) ? ambiguities : [];
        const clarificationPromises = validAmbiguities.slice(0, 5).map(async (amb: any) => {
            try {
                const clar = await aiService.clarifyAmbiguity(amb.snippet, amb.reason, language);
                return new Clarification({
                    videoId: video._id,
                    transcriptSnippet: amb.snippet,
                    reason: amb.reason,
                    clarificationText: clar.clarificationText,
                    examples: clar.examples
                }).save();
            } catch (err) {
                console.error('Failed to save individual clarification:', err);
                return null;
            }
        });

        await Promise.all([...summaryPromises, ...questionPromises, ...clarificationPromises]);

        res.status(201).json({ videoId: video._id, title: video.title });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ message: error.message || 'Analysis failed' });
    }
});

// GET /api/videos
router.get('/', authenticateToken as any, async (req: AuthRequest, res) => {
    try {
        const videos = await Video.find({ userId: req.user?.id }).sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/videos/:id
router.get('/:id', authenticateToken as any, async (req: AuthRequest, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const summaries = await Summary.find({ videoId: video._id });
        res.json({ video, summaries });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
