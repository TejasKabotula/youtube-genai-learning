import mongoose, { Schema, Document } from 'mongoose';

export interface IClarification extends Document {
    videoId: mongoose.Types.ObjectId;
    transcriptSnippet: string;
    reason: string;
    clarificationText: string;
    examples?: string[];
    createdAt: Date;
}

const ClarificationSchema: Schema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    transcriptSnippet: { type: String, required: true },
    reason: { type: String, required: true },
    clarificationText: { type: String, required: true },
    examples: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IClarification>('Clarification', ClarificationSchema);
