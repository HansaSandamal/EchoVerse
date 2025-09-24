import React, { useState } from 'react';
import { JournalEntry, MoodOption } from '../../types';
import ProgressChart from '../shared/ProgressChart';
import StreakTracker from '../shared/StreakTracker';
import AchievementsGrid from '../shared/AchievementsGrid';
import { format, parseISO } from 'date-fns';
import { getAIConnections } from '../../services/geminiService';
import { MOOD_OPTIONS } from '../../constants';

interface ProgressScreenProps {
    journalHistory: JournalEntry[];
    streak: number;
    isPremium: boolean;
    onUpgradeRequest: () => void;
}

const ConnectionsCard: React.FC<{ history: JournalEntry[], isPremium: boolean, onUpgradeRequest: () => void }> = ({ history, isPremium, onUpgradeRequest }) => {
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!isPremium) {
            onUpgradeRequest();
            return;
        }
        setIsLoading(true);
        setInsight('');
        const result = await getAIConnections(history);
        setInsight(result);
        setIsLoading(false);
    };

    return (
        <div className="p-6 bg-content-light dark:bg-content-dark rounded-2xl shadow-lg border border-purple-300 dark:border-purple-500/30">
            <div className="flex items-center mb-4">
                 <div className="p-2 bg-purple-500/20 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h2 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">Connect the Dots</h2>
            </div>

            {insight && !isLoading && (
                <p className="text-text-secondary-light dark:text-text-secondary-dark italic">"{insight}"</p>
            )}

            {isLoading && (
                 <div className="text-center text-text-secondary-light dark:text-text-secondary-dark">
                    <svg className="animate-spin mx-auto h-6 w-6 text-purple-500 dark:text-purple-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Echo AI is analyzing your patterns...
                </div>
            )}
            
            {!insight && !isLoading && (
                <>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                        {isPremium ? "Generate a new AI insight that connects themes and moods from your recent entries." : "Unlock this feature with Premium to find deeper patterns in your journal."}
                    </p>
                    <button onClick={handleGenerate} className="w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-600 dark:to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity">
                       {isPremium ? 'Generate Insight' : '✨ Upgrade to Unlock'}
                    </button>
                </>
            )}
        </div>
    );
};

const ProgressScreen: React.FC<ProgressScreenProps> = ({ journalHistory, streak, isPremium, onUpgradeRequest }) => {
    // Filter out any potentially corrupted (null/undefined) entries from local storage.
    const cleanJournalHistory = journalHistory.filter(Boolean);
    const displayedHistory = isPremium ? cleanJournalHistory : cleanJournalHistory.slice(-7);

    const moodColorMap: { [key: string]: { border: string } } = {
        'Happy': { border: 'border-yellow-400' },
        'Calm': { border: 'border-blue-400' },
        'Sad': { border: 'border-indigo-400' },
        'Angry': { border: 'border-red-400' },
        'Tired': { border: 'border-purple-400' },
        'Optimistic': { border: 'border-green-400' },
        'Anxious': { border: 'border-orange-400' },
        'Neutral': { border: 'border-gray-400' },
    };

    const JournalLogItem = ({ entry }: { entry: JournalEntry }) => {
        const moodOption = MOOD_OPTIONS.find(option => option.mood === entry.detectedMood);
        const emoji = moodOption ? moodOption.emoji : '📝';
        const colors = moodColorMap[entry.detectedMood] || moodColorMap['Neutral'];

        return (
            <div className={`bg-content-light dark:bg-content-dark rounded-xl shadow-sm border-l-4 ${colors.border}`}>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">{emoji}</span>
                            <div>
                                <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{entry.detectedMood}</p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{format(parseISO(entry.date), 'MMM d, h:mm a')}</p>
                            </div>
                        </div>
                    </div>
                    {entry.summary && <p className="text-sm text-text-primary-light dark:text-text-primary-dark italic">"{entry.summary}"</p>}
                    {entry.audioUrl && <audio src={entry.audioUrl} controls className="w-full h-9 rounded-full" />}
                    {entry.themes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            {entry.themes.map(theme => (
                                <span key={theme} className="px-2 py-1 text-xs bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full">{theme}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const PremiumUpsell: React.FC<{ message: string }> = ({ message }) => (
        <div className="text-center p-8 bg-bkg-light dark:bg-bkg-dark rounded-xl">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">{message}</p>
            <button
                onClick={onUpgradeRequest}
                className="mt-4 py-2 px-5 bg-accent-light dark:bg-accent-dark text-white font-semibold rounded-lg shadow-md hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover transition-all duration-200"
            >
                Upgrade to Premium
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Your Progress</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Review your journey and celebrate your consistency.</p>
            </div>
            
            <StreakTracker streak={streak} />
            
            <ConnectionsCard history={cleanJournalHistory} isPremium={isPremium} onUpgradeRequest={onUpgradeRequest} />

            <AchievementsGrid journalHistory={cleanJournalHistory} streak={streak} />
            
            <div className="p-4 sm:p-6 bg-content-light dark:bg-content-dark rounded-2xl shadow-md">
                <h2 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">Sentiment Trends</h2>
                {isPremium ? (
                    <div className="h-64 w-full">
                        <ProgressChart data={cleanJournalHistory} />
                    </div>
                ) : (
                    <PremiumUpsell message="Unlock detailed sentiment charts with Premium." />
                )}
            </div>

            <div>
                <h2 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">Journal Log</h2>
                <div className="space-y-3">
                    {displayedHistory.length > 0 ? (
                        [...displayedHistory].reverse().map((entry, index) => <JournalLogItem key={index} entry={entry} />)
                    ) : (
                        <p className="text-center text-text-secondary-light dark:text-text-secondary-dark p-8">No journal entries yet. Record your first Echo on the Home screen to get started!</p>
                    )}
                    {!isPremium && cleanJournalHistory.length > 7 && (
                        <PremiumUpsell message="Upgrade to see your full journal history." />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressScreen;