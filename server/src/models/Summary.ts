import mongoose, { Schema, Document } from 'mongoose';

export interface ISummary extends Document {
    videoId: mongoose.Types.ObjectId;
    level: 'short' | 'medium' | 'detailed';
    content: string;
}

const SummarySchema: Schema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    level: { type: String, enum: ['short', 'medium', 'detailed'], required: true },
    content: { type: String, required: true }
});

export default mongoose.model<ISummary>('Summary', SummarySchema);
