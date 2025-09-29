import React from 'react';
// FIX: Removed file extensions from imports for proper module resolution.
import { JournalEntry } from '../../types';
import { ACHIEVEMENTS } from '../../constants';
import Badge from './Badge';

interface AchievementsGridProps {
    journalHistory: JournalEntry[];
    streak: number;
}

const AchievementsGrid: React.FC<AchievementsGridProps> = ({ journalHistory, streak }) => {
    return (
        <div>
            <h2 className="font-semibold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">Achievements</h2>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 p-4 bg-content-light dark:bg-content-dark rounded-2xl shadow-md">
                {ACHIEVEMENTS.map(achievement => {
                    const isUnlocked = achievement.unlockCondition({ journalHistory, streak });
                    return <Badge key={achievement.id} achievement={achievement} isUnlocked={isUnlocked} />;
                })}
            </div>
        </div>
    );
};

export default AchievementsGrid;
