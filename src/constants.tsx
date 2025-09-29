import React from 'react';
// FIX: Removed file extension from import for proper module resolution.
import { NavItem, Screen, Achievement, DetectedMood, MoodOption } from './types';

// Icons
const HomeIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const ChartIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18" /></svg>
);
const SettingsIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export const NAV_ITEMS: NavItem[] = [
    { screen: Screen.Home, label: 'Home', icon: HomeIcon },
    { screen: Screen.Progress, label: 'Progress', icon: ChartIcon },
    { screen: Screen.Settings, label: 'Settings', icon: SettingsIcon },
];

export const MOOD_OPTIONS: MoodOption[] = [
    { mood: DetectedMood.Happy,       emoji: '😄', color: 'text-yellow-400' },
    { mood: DetectedMood.Calm,        emoji: '😌', color: 'text-blue-400' },
    { mood: DetectedMood.Sad,         emoji: '😢', color: 'text-indigo-400' },
    { mood: DetectedMood.Angry,       emoji: '😠', color: 'text-red-400' },
    { mood: DetectedMood.Tired,       emoji: '😴', color: 'text-purple-400' },
    { mood: DetectedMood.Optimistic,  emoji: '😊', color: 'text-green-400' },
    { mood: DetectedMood.Anxious,     emoji: '😟', color: 'text-orange-400' },
    { mood: DetectedMood.Neutral,     emoji: '😐', color: 'text-gray-400' },
];

// Achievement Icons
const FirstStepIcon = ({ className }: { className: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const Streak7Icon = ({ className }: { className:string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const NoteTakerIcon = ({ className }: { className: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const FullSpectrumIcon = ({ className }: { className: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>;
const ConsistencyIcon = ({ className }: { className: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_entry',
        name: 'First Echo',
        description: 'Record your first voice journal entry.',
        icon: FirstStepIcon,
        unlockCondition: ({ journalHistory }) => journalHistory.length >= 1,
    },
    {
        id: 'streak_7',
        name: 'On Fire',
        description: 'Maintain a 7-day journaling streak.',
        icon: Streak7Icon,
        unlockCondition: ({ streak }) => streak >= 7,
    },
    {
        id: 'notetaker_5',
        name: 'Mindful Mapper',
        description: 'Journal on 5 different days.',
        icon: NoteTakerIcon,
        unlockCondition: ({ journalHistory }) => {
             const uniqueDaysWithNotes = new Set(
                journalHistory.map(entry => entry.date.substring(0, 10))
            );
            return uniqueDaysWithNotes.size >= 5;
        },
    },
    {
        id: 'full_spectrum',
        name: 'Full Spectrum',
        description: 'Log 5 different AI-detected mood types.',
        icon: FullSpectrumIcon,
        unlockCondition: ({ journalHistory }) => {
            const loggedMoods = new Set(journalHistory.map(entry => entry.detectedMood));
            return loggedMoods.size >= 5;
        }
    },
    {
        id: 'consistency_30',
        name: 'Consistency King',
        description: 'Complete 30 total journal entries.',
        icon: ConsistencyIcon,
        unlockCondition: ({ journalHistory }) => journalHistory.length >= 30,
    }
];
