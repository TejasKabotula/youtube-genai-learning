import * as aiService from './src/services/aiService';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const transcript = "This is a demo transcript provided because the real subtitles could not be fetched for this YouTube video. It covers the core aspects of artificial intelligence, machine learning, and their impact on modern society. The speaker discusses how neural networks have evolved to solve complex problems and why data quality is the most crucial factor in model performance.";

async function run() {
    const summary = await aiService.generateSummaries(transcript, "English");
    const questions = await aiService.generateQuestions(transcript, "mcq", "hard", "English", 5);

    const output = {
        summary,
        questions
    };

    fs.writeFileSync('analysis_result.json', JSON.stringify(output, null, 2));
    console.log("Analysis saved to analysis_result.json");
}

run().catch(error => {
    fs.writeFileSync('analysis_error.txt', error.stack || error.message);
    process.exit(1);
});
