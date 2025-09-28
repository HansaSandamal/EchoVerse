import { JournalEntry, DetectedMood, AIAnalysisResult } from '../types';

const MOCK_ANALYSIS: AIAnalysisResult = {
    detectedMood: DetectedMood.Neutral,
    summary: "This is a mock summary of your journal entry. The AI would normally provide a concise overview of your thoughts here.",
    sentiment: "Neutral",
    rating: 5,
    themes: ["mock", "testing"],
};

export const checkAIServiceAvailability = async (): Promise<boolean> => {
    try {
        const response = await fetch('/api/gemini-proxy');
        if (!response.ok) return false;
        const data = await response.json();
        return data.available === true;
    } catch (error) {
        console.error("AI service availability check failed:", error);
        return false;
    }
};

export const getAIAnalysisForEntry = async (note: string): Promise<AIAnalysisResult> => {
    if (!note.trim()) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_ANALYSIS;
    }

    try {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'analyze', payload: { note } }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch AI analysis');
        }
        
        const jsonText = await response.text();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error fetching AI analysis via proxy:", error);
        return {
            ...MOCK_ANALYSIS,
            summary: "Sorry, I couldn't generate an analysis right now. Please try again later."
        };
    }
};

export const getAIConnections = async (history: JournalEntry[]): Promise<string> => {
    if (history.length < 3) {
        return "You need at least 3 journal entries for me to find connections. Keep up your journaling habit!";
    }
    
    try {
        const response = await fetch('/api/gemini-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'connect', payload: { history } }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch AI connections');
        }

        const data = await response.json();
        const insightText = data.insight;

        if (!insightText) {
             return "I looked through your recent entries, but couldn't find a clear connection just yet. Keep journaling, and I'll try again soon!";
        }

        return insightText;

    } catch(error) {
        console.error("Error fetching AI connections via proxy:", error);
        return "Sorry, I couldn't generate your connection insights right now. Please try again in a bit.";
    }
}
