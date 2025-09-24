import React from 'react';

interface StreakTrackerProps {
    streak: number;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({ streak }) => {
    return (
        <div className="p-6 bg-content-light dark:bg-content-dark rounded-2xl shadow-md flex items-center justify-between">
            <div>
                <h2 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">Current Streak</h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Keep it up! Consistency is key.</p>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-4xl font-bold text-orange-500 dark:text-orange-400">{streak}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500 dark:text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 01-1.898-.632l4-12a1 1 0 011.265-.633zM10 18a1 1 0 01.707.293l2 2a1 1 0 11-1.414 1.414l-2-2A1 1 0 0110 18zm-7.707-4.293a1 1 0 010-1.414l2-2a1 1 0 011.414 1.414l-2 2a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path d="M10 2.25a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0110 2.25zM15.25 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75zM4.75 10a.75.75 0 01.75-.75h.5a.75.75 0 010 1.5h-.5a.75.75 0 01-.75-.75z" />
                    <path d="M12.438 12.438a.75.75 0 010 1.062l-.5.5a.75.75 0 01-1.062-1.062l.5-.5a.75.75 0 011.062 0zM8.062 8.062a.75.75 0 010 1.062l-.5.5a.75.75 0 11-1.062-1.062l.5-.5a.75.75 0 011.062 0z" />
                </svg>
            </div>
        </div>
    );
};

export default StreakTracker;