import { GoogleGenAI, Type } from "@google/genai";
import { JournalEntry, DetectedMood, AIAnalysisResult } from './types';

// Fix: Use `process.env.API_KEY` to access the API key as per the coding guidelines,
// which also resolves the TypeScript error for `import.meta.env`.
const apiKey = process.env.API_KEY;

if (!apiKey) {
  // Fix: Updated warning message to reflect the correct environment variable name.
  console.warn("API_KEY environment variable not set. AI features will be mocked.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey: apiKey }) : null;

// Export a status check for the rest of the app to use, especially for debugging.
export const isAIServiceAvailable = !!ai;

const MOCK_ANALYSIS: AIAnalysisResult = {
    detectedMood: DetectedMood.Neutral,
    summary: "This is a mock summary of your journal entry. The AI would normally provide a concise overview of your thoughts here.",
    sentiment: "Neutral",
    rating: 5,
    themes: ["mock", "testing"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        detectedMood: {
            type: Type.STRING,
            description: "The primary mood detected from the text.",
            enum: Object.values(DetectedMood),
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one or two-sentence summary of the journal entry."
        },
        sentiment: {
            type: Type.STRING,
            description: "The overall sentiment of the text (e.g., 'Positive', 'Negative', 'Neutral', 'Mixed')."
        },
        rating: {
            type: Type.NUMBER,
            description: "A sentiment score from 1 (very negative) to 10 (very positive)."
        },
        themes: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING
            },
            description: "A list of 2-3 key themes or topics mentioned (e.g., 'Work', 'Family', 'Anxiety')."
        }
    },
    required: ["detectedMood", "summary", "sentiment", "rating", "themes"]
};

export const getAIAnalysisForEntry = async (note: string): Promise<AIAnalysisResult> => {
    if (!ai) {
        // Fix: Updated error message to reference the correct environment variable name.
        console.error("Gemini AI service is not available. Ensure API_KEY is set in the environment.");
        return {
            ...MOCK_ANALYSIS,
            summary: "AI analysis is unavailable due to a missing API key. This is a mock analysis.",
            themes: ["config-error"],
        };
    }
    if (!note.trim()) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_ANALYSIS;
    }

    try {
        const prompt = `Analyze the following journal entry. Based on the text, provide the detected mood, a brief summary, the overall sentiment, a sentiment rating from 1 to 10, and a list of key themes.
        Journal Entry: "${note}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.5,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        return {
            ...MOCK_ANALYSIS,
            summary: "Sorry, I couldn't generate an analysis right now. Please try again later."
        };
    }
};

export const getAIConnections = async (history: JournalEntry[]): Promise<string> => {
    // If AI is not available (e.g., missing API key), return a clear error message.
    if (!ai) {
        // Fix: Updated error message to reference the correct environment variable name.
        console.error("Gemini AI service is not available. Ensure API_KEY is set in the environment.");
        return "The AI insight service is currently unavailable. This is likely due to a missing API key in the application's configuration.";
    }

    // If there aren't enough entries for a meaningful analysis, inform the user.
    if (history.length < 3) {
        return "You need at least 3 journal entries for me to find connections. Keep up your journaling habit!";
    }
    
    try {
        // Create a concise summary of the last 10 entries to send to the model
        const historySummary = history.slice(-10).map(entry => 
            `Date: ${entry.date.substring(0,10)}\nDetected Mood: ${entry.detectedMood}\nSummary: ${entry.summary}\nThemes: ${entry.themes.join(', ')}`
        ).join('\n\n---\n\n');

        const prompt = `
            You are a compassionate self-reflection assistant. Analyze the following series of journal entries from a user. 
            Identify one or two interesting patterns, recurring themes, or connections between their moods and the topics they discuss.
            Present this insight in a gentle, supportive, and thoughtful way. Address the user directly ("You mentioned...", "I noticed that...").
            Keep the insight concise (3-4 sentences).

            Journal History:
            ${historySummary}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                topP: 1,
                topK: 32,
            }
        });
        
        const insightText = response.text.trim();

        // Handle cases where the model might return an empty response
        if (!insightText) {
             console.warn("AI returned an empty insight for 'Connect the Dots'.");
             return "I looked through your recent entries, but couldn't find a clear connection just yet. Keep journaling, and I'll try again soon!";
        }

        return insightText;

    } catch(error) {
        console.error("Error fetching AI connections:", error);
        return "Sorry, I couldn't generate your connection insights right now. Please try again in a bit.";
    }
}