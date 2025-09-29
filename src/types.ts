// This file contains shared type definitions used across the application.
// It is intentionally kept free of direct 'react' imports to prevent
// potential runtime errors in the in-browser transpilation environment.

export type AIStatus = 'checking' | 'available' | 'unavailable';

export enum Screen {
    Login = 'login',
    Home = 'home',
    Progress = 'progress',
    Settings = 'settings',
    Privacy = 'privacy',
    LiveConversation = 'live',
}

export interface NavItem {
    screen: Screen;
    label: string;
    // A functional component for the icon is expected here.
    // Using 'any' for the return type to avoid a direct dependency on React/JSX types.
    icon: (props: { className: string }) => any;
}

export enum DetectedMood {
    Happy = 'Happy',
    Calm = 'Calm',
    Sad = 'Sad',
    Angry = 'Angry',
    Tired = 'Tired',
    Optimistic = 'Optimistic',
    Anxious = 'Anxious',
    Neutral = 'Neutral',
}

export interface MoodOption {
    mood: DetectedMood;
    emoji: string;
    color: string;
}

export interface AIAnalysisResult {
    detectedMood: DetectedMood;
    summary: string;
    sentiment: string;
    rating: number; // 1-10 scale
    themes: string[];
}

export interface JournalEntry extends AIAnalysisResult {
    date: string; // ISO string
    note: string;
    audioUrl?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    // A functional component for the icon is expected here.
    // Using 'any' for the return type to avoid a direct dependency on React/JSX types.
    icon: (props: { className: string }) => any;
    unlockCondition: (stats: { journalHistory: JournalEntry[], streak: number }) => boolean;
}

export type ColorTheme = 'indigo' | 'forest' | 'sunset';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
    name: string;
    email: string;
    photoURL: string;
}