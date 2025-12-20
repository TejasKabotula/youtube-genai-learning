import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GROK_API_KEY;
const isGroq = key?.startsWith('gsk_');
const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';

console.log(`Testing Key: ${key?.substring(0, 8)}...${key?.substring(key.length - 4)}`);
console.log(`Provider detected: ${isGroq ? 'Groq' : 'xAI'}`);
console.log(`URL: ${url}`);

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function test() {
    try {
        const response = await axios.post(url, {
            model: isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 5
        }, {
            headers: { Authorization: `Bearer ${key}` },
            httpsAgent
        });
        console.log('SUCCESS:', response.data.choices[0].message.content);
    } catch (error: any) {
        console.log('FAILED:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data));
        }
    }
}

test();
