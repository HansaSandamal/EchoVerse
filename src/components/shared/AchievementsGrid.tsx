import React from 'react';
import { JournalEntry } from '../../types.ts';
import { ACHIEVEMENTS } from '../../constants.tsx';
import Badge from './Badge.tsx';

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
