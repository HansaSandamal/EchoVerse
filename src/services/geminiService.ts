import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, DetectedMood, AIAnalysisResult } from '../types.ts';

// Per instructions, assume process.env.API_KEY is available in the execution environment.
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// The schema for AI analysis, used to ensure a consistent JSON output.
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        detectedMood: { type: Type.STRING, enum: Object.values(DetectedMood), description: "The primary mood detected in the entry." },
        summary: { type: Type.STRING, description: "A concise, one or two sentence summary of the journal entry." },
        sentiment: { type: Type.STRING, description: "The overall sentiment (e.g., Positive, Negative, Neutral, Mixed)." },
        rating: { type: Type.NUMBER, description: "A sentiment rating on a scale of 1 to 10, where 1 is very negative and 10 is very positive." },
        themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-4 key themes or topics mentioned (e.g., 'work', 'family', 'gratitude')." }
    },
    required: ["detectedMood", "summary", "sentiment", "rating", "themes"]
};

/**
 * Checks if the AI service is configured and available.
 * @returns {Promise<boolean>} A promise that resolves to true if the API key is present, false otherwise.
 */
export const checkAIServiceAvailability = async (): Promise<boolean> => {
    return !!ai;
};

/**
 * Sends a journal entry note to the Gemini API for analysis.
 * @param {string} note The user's journal entry text.
 * @returns {Promise<AIAnalysisResult>} The structured analysis from the AI.
 */
export const getAIAnalysisForEntry = async (note: string): Promise<AIAnalysisResult> => {
    if (!ai) {
        throw new Error("AI service is not available. API key may be missing.");
    }
    
    const prompt = `Analyze the following journal entry. Based on the text, provide the detected mood, a brief summary, the overall sentiment, a sentiment rating from 1 to 10, and a list of key themes. Journal Entry: "${note}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.5
            }
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Error getting AI analysis:", error);
        throw new Error("Failed to get AI analysis from the service.");
    }
};

/**
 * Sends journal history to the AI to find patterns and connections.
 * @param {JournalEntry[]} history A list of past journal entries.
 * @returns {Promise<string>} A string containing the AI-generated insight.
 */
export const getAIConnections = async (history: JournalEntry[]): Promise<string> => {
    if (!ai) {
        return "The AI insight service is currently unavailable. This is likely due to a missing API key in the application's configuration.";
    }

    if (history.length < 3) {
        return "You need at least 3 journal entries for me to find connections. Keep up your journaling habit!";
    }

    const historySummary = history.slice(-10).map(e => `Date: ${e.date.substring(0,10)}\nMood: ${e.detectedMood}\nSummary: ${e.summary}`).join('\n---\n');
    const prompt = `You are a compassionate self-reflection assistant. Analyze the journal entries. Identify one interesting pattern or connection. Present this insight gently to the user (e.g., "I noticed that..."). Keep it concise (3-4 sentences). History:\n${historySummary}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8
            }
        });

        const insightText = response.text;
        
        if (!insightText?.trim()) {
             return "I looked through your recent entries, but couldn't find a clear connection just yet. Keep journaling, and I'll try again soon!";
        }
        
        return insightText;

    } catch (error) {
        console.error("Error getting AI connections:", error);
        return "Sorry, I couldn't generate your connection insights right now. Please try again in a bit.";
    }
};