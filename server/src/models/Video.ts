import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic {
    topic: string;
    start: number;
    end: number;
    keyInsight: string;
}

export interface IVideo extends Document {
    userId: mongoose.Types.ObjectId;
    sourceType: 'youtube' | 'upload';
    youtubeUrl?: string;
    filePath?: string;
    title: string;
    thumbnailUrl?: string;
    language: string;
    transcript: string;
    duration: number;
    topics: ITopic[];
    createdAt: Date;
}

const VideoSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sourceType: { type: String, enum: ['youtube', 'upload'], required: true },
    youtubeUrl: { type: String },
    filePath: { type: String },
    title: { type: String, required: true },
    thumbnailUrl: { type: String },
    language: { type: String, required: true },
    transcript: { type: String, required: true },
    duration: { type: Number, default: 0 },
    topics: [{
        topic: { type: String },
        start: { type: Number },
        end: { type: Number },
        keyInsight: { type: String }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVideo>('Video', VideoSchema);
