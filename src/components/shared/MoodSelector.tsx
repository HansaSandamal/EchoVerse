import React from 'react';
import { DetectedMood } from '../../types.ts';
import { MOOD_OPTIONS } from '../../constants.ts';

interface MoodSelectorProps {
    selectedMood: DetectedMood | null;
    setSelectedMood: (mood: DetectedMood) => void;
    rating: number;
    setRating: (rating: number) => void;
}

const MoodSelector = ({ selectedMood, setSelectedMood, rating, setRating }: MoodSelectorProps) => {
    
    const selectedMoodOption = MOOD_OPTIONS.find(option => option.mood === selectedMood);
    
    // Convert Tailwind text color to a usable hex/rgb value for the shadow and slider
    const colorMap: { [key: string]: string } = {
        'text-yellow-400': '#FBBF24',
        'text-blue-400': '#60A5FA',
        'text-indigo-400': '#818CF8',
        'text-red-400': '#F87171',
        'text-purple-400': '#A78BFA',
        'text-green-400': '#4ADE80',
        'text-orange-400': '#FB923C',
        'text-gray-400': '#9CA3AF',
    };

    const glowStyle = selectedMoodOption ? { boxShadow: `0 0 15px ${colorMap[selectedMoodOption.color]}` } : {};
    const sliderStyle = selectedMoodOption ? { accentColor: colorMap[selectedMoodOption.color] } : {};

    return (
        <div className="space-y-6 w-full">
            <div className="grid grid-cols-4 gap-4">
                {MOOD_OPTIONS.map(({ mood, emoji }) => (
                    <button
                        key={mood}
                        onClick={() => setSelectedMood(mood)}
                        aria-label={`Select mood: ${mood}`}
                        className={`flex items-center justify-center text-4xl p-2 rounded-full aspect-square transform transition-all duration-300 ${
                            selectedMood === mood
                                ? 'scale-110 grayscale-0 opacity-100'
                                : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:scale-105'
                        }`}
                        style={selectedMood === mood ? glowStyle : {}}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    <label htmlFor="mood-rating" className="flex items-center">
                        {selectedMoodOption && (
                           <span className="text-2xl mr-2 transition-transform duration-300 transform scale-100">{selectedMoodOption.emoji}</span>
                        )}
                        Intensity
                    </label>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark w-6 text-center text-base">{rating}</span>
                </div>
                <input
                    id="mood-rating"
                    type="range"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer`}
                    style={sliderStyle}
                />
            </div>
        </div>
    );
};

export default MoodSelector;