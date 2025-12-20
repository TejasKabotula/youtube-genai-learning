import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    videoId: mongoose.Types.ObjectId;
    type: 'mcq' | 'open-ended' | 'short-answer' | 'interview';
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    text: string;
    options?: string[];
    correctOptionIndex?: number;
    answerExplanation?: string;
    timestampSeconds?: number;
    tags?: string[];
}

const QuestionSchema: Schema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    type: { type: String, enum: ['mcq', 'open-ended', 'short-answer', 'interview'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], required: true },
    text: { type: String, required: true },
    options: [{ type: String }],
    correctOptionIndex: { type: Number },
    answerExplanation: { type: String },
    timestampSeconds: { type: Number },
    tags: [{ type: String }]
});

export default mongoose.model<IQuestion>('Question', QuestionSchema);
