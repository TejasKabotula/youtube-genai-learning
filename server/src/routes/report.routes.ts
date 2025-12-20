import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Video from '../models/Video';
import Summary from '../models/Summary';
import Question from '../models/Question';
import Clarification from '../models/Clarification';
import { generatePDFReport, generateDocxReport } from '../services/exportService';

const router = express.Router();

// GET /api/videos/:id/report/pdf
router.get('/:videoId/report/pdf', authenticateToken as any, async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const summaries = await Summary.find({ videoId });
        const questions = await Question.find({ videoId });
        const clarifications = await Clarification.find({ videoId });

        const pdfBuffer = await generatePDFReport(video, summaries, questions, clarifications);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${videoId}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate PDF' });
    }
});

// GET /api/videos/:id/report/docx
router.get('/:videoId/report/docx', authenticateToken as any, async (req, res) => {
    try {
        const { videoId } = req.params;
        const video = await Video.findById(videoId);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const summaries = await Summary.find({ videoId });
        const questions = await Question.find({ videoId });
        const clarifications = await Clarification.find({ videoId });

        const docxBuffer = await generateDocxReport(video, summaries, questions, clarifications);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename=report-${videoId}.docx`);
        res.send(docxBuffer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate Word document' });
    }
});

export default router;
