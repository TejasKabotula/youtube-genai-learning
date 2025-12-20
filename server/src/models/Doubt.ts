import mongoose, { Schema, Document } from 'mongoose';

export interface IDoubt extends Document {
    videoId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    relatedTimestamps?: number[];
    createdAt: Date;
}

const DoubtSchema: Schema = new Schema({
    videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    relatedTimestamps: [{ type: Number }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IDoubt>('Doubt', DoubtSchema);
