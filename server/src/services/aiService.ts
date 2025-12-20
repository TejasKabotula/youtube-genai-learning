import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const GROK_API_KEY = process.env.GROK_API_KEY;

// Detect Provider (Groq uses 'gsk_', xAI uses others)
const isGroq = GROK_API_KEY?.startsWith('gsk_');
const API_URL = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
const DEFAULT_MODEL = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

// Safety: Ignore AI_MODEL from .env if it clearly belongs to the other provider
const envModel = process.env.AI_MODEL;
const AI_MODEL = (envModel === 'grok-beta' && isGroq) || (envModel?.includes('llama') && !isGroq)
    ? DEFAULT_MODEL
    : (envModel || DEFAULT_MODEL);

const FORCE_API = process.env.FORCE_API === 'true';

const getMockData = (prompt: string) => {
    if (prompt.includes('summaries')) {
        return JSON.stringify({
            short: "This video provides a comprehensive overview of the subject, focusing on core principles and practical applications.",
            medium: "The speaker explores the history, current state, and future trends of the topic. Key takeaways include the importance of foundational knowledge, modern toolsets, and continuous learning in the field.",
            detailed: "In this session, the instructor breaks down complex concepts into digestible segments. Section 1 covers the historical context and initial breakthroughs. Section 2 deep dives into current industry standards and provides several real-world case studies. The overall message is one of cautious optimism and a call to action for deeper study."
        });
    }
    if (prompt.includes('topics')) {
        return JSON.stringify([
            { topic: "Introduction", start: 0, end: 120, keyInsight: "Setting the stage and defining core terminology." },
            { topic: "Advanced Concepts", start: 121, end: 450, keyInsight: "Explaining the relationship between different system components." },
            { topic: "Summary & FAQ", start: 451, end: 600, keyInsight: "Final wrap-up and answering common trainee questions." }
        ]);
    }
    if (prompt.includes('questions')) {
        return JSON.stringify([
            { type: "mcq", difficulty: "medium", text: "What is the primary goal discussed in the introduction?", options: ["Option A", "Option B", "Option C", "Option D"], correctOptionIndex: 1, answerExplanation: "The speaker explicitly mentions that Option B is the priority.", timestampSeconds: 45 },
            { type: "open-ended", difficulty: "hard", text: "Explain the workflow shown in the second segment.", answerExplanation: "The workflow involves a 3-step synchronization process.", timestampSeconds: 210 }
        ]);
    }

    if (prompt.includes('ambiguous')) {
        return JSON.stringify([
            { snippet: "the relationship between different system components", reason: "The term 'system components' is abstract and could benefit from specific examples.", timestampSeconds: 125 },
            { snippet: "a 3-step synchronization process", reason: "A visual explanation or step-by-step breakdown of these three steps would be helpful.", timestampSeconds: 215 }
        ]);
    }

    if (prompt.includes('Clarify')) {
        return JSON.stringify({
            clarificationText: "This segment refers to the synchronization between variables and the user interface. It ensures that changes in the data are reflected instantly on the screen.",
            definition: "Synchronization: The process of making two or more things work in unison or at the same time.",
            examples: ["Using React state to update a counter", "Cloud storage syncing files between devices"]
        });
    }

    return JSON.stringify({
        answer: "This is a simulated AI response. The API key provided was rejected or is invalid. Please verify your key in the .env file.",
        clarificationText: "Mock clarification active.",
        definition: "Simulated term.",
        examples: ["Example 1", "Example 2"]
    });
};

/**
 * Helper to ensure we always get an array, even if the AI wraps it in an object.
 */
function ensureArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
        // Look for the first property that is an array
        for (const key in data) {
            if (Array.isArray(data[key])) return data[key];
        }
    }
    return [];
}

/**
 * Helper to strip markdown code blocks like ```json ... ``` from a string.
 */
function stripMarkdown(text: string): string {
    return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
}

/**
 * Generic function to call AI API using axios.
 * Automatically detects whether to use Groq or xAI (Grok).
 */
export async function callLLM(prompt: string): Promise<string> {
    const isMockTrigger = !GROK_API_KEY ||
        GROK_API_KEY === 'your_llm_api_key' ||
        GROK_API_KEY === 'your_grok_api_key' ||
        GROK_API_KEY.includes('your_') ||
        GROK_API_KEY.trim() === '';

    if (isMockTrigger) {
        if (FORCE_API) {
            throw new Error('AI MOCK MODE is disabled by FORCE_API, but no valid API key was found in .env. Please provide a real key.');
        }
        console.log(`--- AI MOCK MODE ACTIVE (No valid ${isGroq ? 'Groq' : 'Grok'} key in .env) ---`);
        return getMockData(prompt);
    }

    try {
        console.log(`--- AI CALL: Provider=${isGroq ? 'Groq' : 'xAI'} Model=${AI_MODEL} ---`);

        // Create an agent that ignores SSL certificate errors
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        const response = await axios.post(API_URL, {
            model: AI_MODEL,
            messages: [
                { role: "system", content: "You are a helpful AI tutor. You MUST return valid JSON objects only. Do not include markdown tags like ```json in your response." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROK_API_KEY}`
            },
            httpsAgent,
            timeout: 60000 // 60 seconds
        });

        if (response.data && response.data.choices && response.data.choices[0].message.content) {
            // STRIP MARKDOWN if the model ignored the system prompt
            return stripMarkdown(response.data.choices[0].message.content);
        } else {
            console.error('Unexpected AI API response structure:', JSON.stringify(response.data));
            throw new Error('Invalid response structure from AI API');
        }
    } catch (error: any) {
        const status = error.response?.status;
        const errorData = error.response?.data;

        console.error(`AI API Error [${status}]:`, error.message);
        if (errorData) {
            console.error('AI Error Detail:', JSON.stringify(errorData));
        }

        // If FORCE_API is active, we throw the error instead of falling back to mock
        if (FORCE_API) {
            let userMessage = `AI Analysis Failed [${status || 'Network Error'}]: ${error.message}`;
            if (errorData?.error?.message) userMessage += ` - ${errorData.error.message}`;
            if (status === 401 || status === 403) userMessage = "Authentication failed. Please verify your API key in the .env file.";
            if (status === 429) userMessage = "API rate limit exceeded. Please try again later.";

            throw new Error(userMessage);
        }

        // AUTO-FALLBACK on errors so the user is never stuck (Only if NOT in FORCE_API mode)
        if (status === 429) {
            throw new Error('AI API rate limit exceeded. Please try again later.');
        }

        console.warn('--- AI ERROR: Falling back to MOCK MODE to prevent crash ---');
        return getMockData(prompt);
    }
}

export async function generateSummaries(transcript: string, language: string) {
    const prompt = `
    Analyze the following video transcript and provide summaries in ${language} at three levels: short, medium, and detailed.
    Return only a JSON object with keys "short", "medium", and "detailed".
    
    Transcript:
    ${transcript}
  `;
    const result = await callLLM(prompt);
    return JSON.parse(result);
}

export async function extractTopicsWithTimestamps(transcript: string) {
    const prompt = `
    Analyze the following transcript and extract a list of major topics with their start and end timestamps (in seconds).
    For each topic, provide a brief key insight.
    Return only a JSON array of objects with keys: "topic", "start", "end", "keyInsight".
    
    Transcript:
    ${transcript}
  `;
    const result = await callLLM(prompt);
    return ensureArray(JSON.parse(result));
}

export async function generateQuestions(transcript: string, type: string, difficulty: string, language: string, maxCount: number = 10) {
    const prompt = `
    Generate up to ${maxCount} questions of type "${type}" at ${difficulty} difficulty based on the transcript below.
    Valid question types are: "mcq", "open-ended", "short-answer", "interview".
    Answer in ${language}.
    For MCQs, provide 4 options and the correct option index (0-3).
    For others, provide a model answer.
    Include a related timestamp (in seconds) for each question.
    Return only a JSON array of objects with keys: "type", "difficulty", "text", "options" (array), "correctOptionIndex", "answerExplanation", "timestampSeconds".
    
    Transcript:
    ${transcript}
  `;
    const result = await callLLM(prompt);
    const questions = ensureArray(JSON.parse(result));

    // Normalize types to match Mongoose enum if AI returns variations
    return questions.map((q: any) => ({
        ...q,
        type: q.type === 'open' ? 'open-ended' : q.type
    }));
}

export async function detectAmbiguities(transcript: string) {
    const prompt = `
    Detect ambiguous or unclear segments in the following transcript where a student might need more clarification.
    Return only a JSON array of objects with keys: "snippet", "reason", "timestampSeconds".
    
    Transcript:
    ${transcript}
  `;
    const result = await callLLM(prompt);
    return ensureArray(JSON.parse(result));
}

export async function clarifyAmbiguity(snippet: string, reason: string, language: string) {
    const prompt = `
    Clarify the following ambiguous segment from a video transcript in ${language}.
    Reason for ambiguity: ${reason}
    Snippet: "${snippet}"
    
    Please provide:
    1. A simple definition of key terms.
    2. A step-by-step explanation.
    3. A real-world analogy.
    4. A practical example.
    
    IMPORTANT: You must return a JSON object with strictly these keys: "clarificationText", "examples" (array), "definition".
  `;
    try {
        const result = await callLLM(prompt);
        const data = JSON.parse(result);

        // Normalize and validate
        return {
            clarificationText: data.clarificationText || data.clarification || "No clarification available.",
            examples: ensureArray(data.examples).map((ex: any) => {
                if (typeof ex === 'string') return ex;
                if (typeof ex === 'object' && ex !== null) {
                    // Flatten object: combine all values into a single descriptive string
                    return Object.entries(ex)
                        .filter(([_, v]) => v != null)
                        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                        .join(' | ');
                }
                return String(ex);
            }),
            definition: data.definition || "Definition not provided."
        };
    } catch (error) {
        console.error('Clarification parse error:', error);
        return {
            clarificationText: "Could not generate clarification for this segment.",
            examples: [],
            definition: "Not available."
        };
    }
}

export async function answerUserDoubt(transcriptChunk: string, userQuestion: string, language: string) {
    const prompt = `
    As an AI tutor, answer the student's doubt based on the transcript context provided.
    Answer in ${language}.
    
    Context: ${transcriptChunk}
    Student's Question: ${userQuestion}
    
    Return only a JSON object with key "answer".
  `;
    const result = await callLLM(prompt);
    return JSON.parse(result);
}
