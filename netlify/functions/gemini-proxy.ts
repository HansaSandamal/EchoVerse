import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// --- Types copied from src/types.ts to make the function self-contained ---
enum DetectedMood {
    Happy = 'Happy', Calm = 'Calm', Sad = 'Sad', Angry = 'Angry', Tired = 'Tired',
    Optimistic = 'Optimistic', Anxious = 'Anxious', Neutral = 'Neutral',
}
interface JournalEntry {
    date: string; note: string; detectedMood: DetectedMood;
    summary: string; themes: string[];
}

// --- Schemas and Mocks ---
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        detectedMood: { type: Type.STRING, enum: Object.values(DetectedMood) },
        summary: { type: Type.STRING }, sentiment: { type: Type.STRING },
        rating: { type: Type.NUMBER }, themes: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["detectedMood", "summary", "sentiment", "rating", "themes"]
};

// --- Handler Logic ---
const handler: Handler = async (event: HandlerEvent) => {
    const apiKey = process.env.API_KEY;

    // GET requests are for health checks or fetching the Live API key
    if (event.httpMethod === 'GET') {
        const action = event.queryStringParameters?.action;

        // Securely provide the API key only for the Live API feature
        if (action === 'get-live-key') {
            if (!apiKey) {
                return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on the server.' }) };
            }
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKey }),
            };
        }
        
        // Default GET is the health check for general AI service availability
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ available: !!apiKey }),
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!apiKey) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: "API key is not configured on the server." }),
        };
    }

    const ai = new GoogleGenAI({ apiKey });
    const { action, payload } = JSON.parse(event.body || '{}');

    try {
        if (action === 'analyze') {
            const { note } = payload as { note: string };
            const prompt = `Analyze the following journal entry. Based on the text, provide the detected mood, a brief summary, the overall sentiment, a sentiment rating from 1 to 10, and a list of key themes. Journal Entry: "${note}"`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: analysisSchema, temperature: 0.5 }
            });
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: response.text };
        } 
        
        else if (action === 'connect') {
            const { history } = payload as { history: JournalEntry[] };
            const historySummary = history.slice(-10).map(e => `Date: ${e.date.substring(0,10)}\nMood: ${e.detectedMood}\nSummary: ${e.summary}`).join('\n---\n');
            const prompt = `You are a compassionate self-reflection assistant. Analyze the journal entries. Identify one interesting pattern or connection. Present this insight gently to the user (e.g., "I noticed that..."). Keep it concise (3-4 sentences). History:\n${historySummary}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', contents: prompt,
                config: { temperature: 0.8 }
            });
            return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ insight: response.text }) };
        } 
        
        else {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified.' }) };
        }

    } catch (error) {
        console.error("Error in Gemini Proxy:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An error occurred while communicating with the AI service.' }),
        };
    }
};

export { handler };
