import React, { useState } from 'react';
import { JournalEntry, Screen, AIAnalysisResult, DetectedMood, User } from '../../types';
import VoiceRecorder from '../shared/VoiceRecorder';
import MoodSelector from '../shared/MoodSelector';
import { getAIAnalysisForEntry } from '../../services/geminiService';

interface HomeScreenProps {
    addJournalEntry: (entry: Omit<JournalEntry, 'date'>) => void;
    currentUser: User | null;
}

type EntryMode = 'choice' | 'voice' | 'manual' | 'success';

// A new header component for a consistent look.
const ScreenHeader = ({ onBack, title }: { onBack: () => void; title: string }) => (
    <div className="relative w-full text-center mb-6">
        <button onClick={onBack} className="absolute top-1/2 left-0 -translate-y-1/2 flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
        </button>
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{title}</h2>
    </div>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ addJournalEntry, currentUser }) => {
    const [entryMode, setEntryMode] = useState<EntryMode>('choice');
    const [note, setNote] = useState<string>('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // State for manual mood entry
    const [selectedMood, setSelectedMood] = useState<DetectedMood | null>(null);
    const [rating, setRating] = useState<number>(5);

    const resetState = () => {
        setEntryMode('choice');
        setNote('');
        setAudioUrl(null);
        setIsSaving(false);
        setSelectedMood(null);
        setRating(5);
    };

    const showSuccessAndReset = () => {
        setEntryMode('success');
        setTimeout(() => {
            resetState();
        }, 2000); // Show success for 2 seconds
    };

    const handleRecordingComplete = (url: string) => {
        setAudioUrl(url);
        setNote("Voice note recorded. Add or edit your thoughts for AI analysis.");
    };

    const handleSaveVoiceJournal = async () => {
        if (!note.trim()) {
            alert('Please add a note to your journal entry for analysis.');
            return;
        }
        setIsSaving(true);
        try {
            const analysis: AIAnalysisResult = await getAIAnalysisForEntry(note);
            
            const newEntry: Omit<JournalEntry, 'date'> = {
                note,
                audioUrl: audioUrl || undefined,
                ...analysis,
            };

            addJournalEntry(newEntry);
            showSuccessAndReset();
        } catch (error) {
            console.error("Failed to save voice journal entry:", error);
            alert("Sorry, there was an error saving your entry. Please try again.");
            setIsSaving(false);
        }
    };

    const handleSaveManualJournal = async () => {
        if (!selectedMood) {
            alert('Please select a mood.');
            return;
        }
        setIsSaving(true);
        try {
            // Still get AI analysis on the text note for summary and themes
            const analysis: AIAnalysisResult = note.trim() 
                ? await getAIAnalysisForEntry(note) 
                : { summary: '', sentiment: 'Neutral', themes: [] } as AIAnalysisResult;

            const newEntry: Omit<JournalEntry, 'date'> = {
                note,
                detectedMood: selectedMood, // User's choice overrides AI
                rating: rating, // User's choice overrides AI
                summary: analysis.summary,
                sentiment: analysis.sentiment,
                themes: analysis.themes,
                audioUrl: undefined,
            };
            addJournalEntry(newEntry);
            showSuccessAndReset();
        } catch (error) {
            console.error("Failed to save manual journal entry:", error);
            alert("Sorry, there was an error saving your entry. Please try again.");
            setIsSaving(false);
        }
    };
    
    const Greeting: React.FC = () => {
        const hour = new Date().getHours();
        let greetingText;
        if (hour < 12) greetingText = "Good morning";
        else if (hour < 18) greetingText = "Good afternoon";
        else greetingText = "Good evening";

        const firstName = currentUser?.name.split(' ')[0];

        return (
            <div>
                <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">{greetingText}{firstName ? `, ${firstName}` : ''}</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">What's on your mind today?</p>
            </div>
        )
    }

    const renderContent = () => {
        switch (entryMode) {
             case 'success':
                return (
                    <div className="flex flex-col items-center justify-center text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Entry Saved!</h2>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark">Your thoughts have been recorded.</p>
                    </div>
                );
            case 'voice':
                return (
                    <>
                        {!audioUrl ? (
                            <div className="w-full flex flex-col items-center animate-fade-in-up">
                                <ScreenHeader onBack={resetState} title="Record Voice Journal" />
                                <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
                            </div>
                        ) : (
                            <div className="w-full flex flex-col items-center animate-fade-in-up">
                                 <h2 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">Your New Echo</h2>
                                 <audio src={audioUrl} controls className="w-full mb-4 rounded-full" />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Add your thoughts..."
                                    className="w-full mt-2 p-3 bg-bkg-light dark:bg-bkg-dark text-text-primary-light dark:text-text-primary-dark rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:outline-none transition-shadow"
                                    rows={5}
                                />
                                <div className="flex w-full space-x-3 mt-4">
                                    <button onClick={resetState} disabled={isSaving} className="w-full py-3 px-4 bg-gray-500 dark:bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors active:animate-button-press">Discard</button>
                                    <button onClick={handleSaveVoiceJournal} disabled={isSaving} className="w-full py-3 px-4 bg-accent-light dark:bg-accent-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center transition-colors active:animate-button-press">
                                        {isSaving ? 'Analyzing...' : "Save Journal"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                );

            case 'manual':
                return (
                    <div className="w-full animate-fade-in-up space-y-4">
                        <ScreenHeader onBack={resetState} title="How are you feeling?" />
                        <MoodSelector selectedMood={selectedMood} setSelectedMood={setSelectedMood} rating={rating} setRating={setRating} />
                         <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note (optional)..."
                            className="w-full p-3 bg-bkg-light dark:bg-bkg-dark text-text-primary-light dark:text-text-primary-dark rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark focus:outline-none transition-shadow"
                            rows={3}
                        />
                        <div className="flex w-full space-x-3 pt-2">
                             <button onClick={resetState} disabled={isSaving} className="w-full py-3 px-4 bg-gray-500 dark:bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 transition-colors active:animate-button-press">Discard</button>
                            <button onClick={handleSaveManualJournal} disabled={isSaving} className="w-full py-3 px-4 bg-accent-light dark:bg-accent-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center transition-colors active:animate-button-press">
                                {isSaving ? 'Saving...' : "Save Mood"}
                            </button>
                        </div>
                    </div>
                );

            case 'choice':
            default:
                return (
                    <div className="w-full space-y-4 animate-fade-in-up">
                        <button onClick={() => setEntryMode('voice')} className="w-full text-left p-6 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl border-2 border-transparent hover:border-purple-400 transition-all duration-300 group hover:shadow-xl hover:scale-[1.02]">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500/20 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 dark:text-purple-300" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/><path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Record Voice Journal</h3>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Speak your mind and let our AI find insights.</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 dark:text-purple-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>
                         <button onClick={() => setEntryMode('manual')} className="w-full text-left p-6 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl border-2 border-transparent hover:border-indigo-400 transition-all duration-300 group hover:shadow-xl hover:scale-[1.02]">
                            <div className="flex items-center">
                                <div className="p-3 bg-indigo-500/20 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Log Mood Manually</h3>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Quickly select a mood and add a note.</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500 dark:text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>
                    </div>
                );
        }
    }

    return (
        <div className="space-y-8">
            <Greeting />
            
            <div className="relative p-6 bg-gradient-to-br from-content-light to-bkg-light dark:from-content-dark dark:to-bkg-dark rounded-2xl shadow-lg min-h-[350px] flex flex-col justify-center items-center text-center">
                <div key={entryMode} className="w-full">
                     {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;