import React from 'react';

interface InsightCardProps {
    insight: string;
    isLoading: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, isLoading }) => {
    return (
        <div className="p-6 bg-content-light dark:bg-content-dark rounded-2xl shadow-md">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-accent-light/10 dark:bg-accent-dark/10 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent-light dark:text-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 12.728l-.707.707M15 21v-4.5A2.5 2.5 0 0012.5 14h-1A2.5 2.5 0 009 16.5V21" />
                    </svg>
                </div>
                <h2 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">AI Wellness Tip</h2>
            </div>
            
            {isLoading ? (
                <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-3 py-1">
                        <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded col-span-2"></div>
                                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded col-span-1"></div>
                            </div>
                            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                    {insight || "Check in with your mood to receive a personalized wellness tip for your day."}
                </p>
            )}
        </div>
    );
};

export default InsightCard;