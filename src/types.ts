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
    icon: React.FC<{ className: string }>;
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
    icon: React.FC<{ className: string }>;
    unlockCondition: (stats: { journalHistory: JournalEntry[], streak: number }) => boolean;
}

export type ColorTheme = 'indigo' | 'forest' | 'sunset';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
    name: string;
    email: string;
    photoURL: string;
}