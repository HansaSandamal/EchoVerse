import React from 'react';
import { Achievement } from '../../types.ts';

interface BadgeProps {
    achievement: Achievement;
    isUnlocked: boolean;
}

const LockedIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const Badge: React.FC<BadgeProps> = ({ achievement, isUnlocked }) => {
    return (
        <div className="group relative flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${isUnlocked ? 'bg-yellow-400/20 text-yellow-500 dark:text-yellow-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                {isUnlocked ? (
                    <achievement.icon className="w-8 h-8" />
                ) : (
                    <LockedIcon className="w-8 h-8" />
                )}
            </div>
            
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-sm text-center bg-gray-800/90 dark:bg-gray-900/90 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                <p className="font-bold">{achievement.name}</p>
                <p className="text-xs">{achievement.description}</p>
            </div>
        </div>
    );
};

export default Badge;
