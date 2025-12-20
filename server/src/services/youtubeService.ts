import { YoutubeTranscript } from 'youtube-transcript';

export function extractVideoId(url: string): string | null {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

export async function getTranscript(youtubeUrl: string): Promise<string> {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
        throw new Error('Invalid YouTube URL');
    }

    try {
        const transcriptConfig = await YoutubeTranscript.fetchTranscript(videoId);
        const transcript = transcriptConfig.map(t => t.text).join(' ').trim();

        if (!transcript) {
            throw new Error('Transcript is empty');
        }

        console.log(`Successfully fetched transcript for video: ${videoId} (${transcript.length} chars)`);
        return transcript;
    } catch (error: any) {
        console.error('Error fetching real transcript:', error.message);
        console.warn('--- TRANSCRIPT FALLBACK ACTIVE: Using Demo Transcript ---');

        return "This is a demo transcript provided because the real subtitles could not be fetched for this YouTube video. It covers the core aspects of artificial intelligence, machine learning, and their impact on modern society. The speaker discusses how neural networks have evolved to solve complex problems and why data quality is the most crucial factor in model performance.";
    }
}

/**
 * Mock function for Whisper transcription
 */
export async function transcribeLocalVideo(filePath: string): Promise<string> {
    console.log(`Simulating Whisper transcription for: ${filePath}`);
    // TODO: Integrate actual Whisper API or local model here.
    return "This is a simulated transcript from a locally uploaded video. In a real application, you would use OpenAI's Whisper API or a self-hosted Whisper model to convert audio/video to text.";
}
