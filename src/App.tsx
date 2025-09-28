import React, { useState, useEffect, useMemo } from 'react';
import { Screen, JournalEntry, ColorTheme, ThemeMode, User } from './types';
import LoginScreen from './components/screens/LoginScreen';
import HomeScreen from './components/screens/HomeScreen';
import ProgressScreen from './components/screens/ProgressScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import PrivacyPolicyScreen from './components/screens/PrivacyPolicyScreen';
import LiveConversationScreen from './components/screens/LiveConversationScreen';
import BottomNav from './components/shared/BottomNav';
import PremiumModal from './components/shared/PremiumModal';
import ConfirmationModal from './components/shared/ConfirmationModal';
import { NAV_ITEMS } from './constants';
import { isToday, isYesterday, differenceInCalendarDays } from 'date-fns';

// Custom hook for persisting state to localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
    const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
    const [journalHistory, setJournalHistory] = useLocalStorage<JournalEntry[]>('journalHistory', []);
    const [isPremium, setIsPremium] = useLocalStorage<boolean>('isPremium', false);
    const [colorTheme, setColorTheme] = useLocalStorage<ColorTheme>('colorTheme', 'indigo');
    const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', 'system');
    
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

    // Apply color theme class
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('theme-indigo', 'theme-forest', 'theme-sunset');
        root.classList.add(`theme-${colorTheme}`);
    }, [colorTheme]);

    // Apply light/dark mode class
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
          themeMode === 'dark' ||
          (themeMode === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.toggle('dark', isDark);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (themeMode === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [themeMode]);


    const handleLogin = (user: User) => {
        setCurrentUser(user);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveScreen(Screen.Home);
    };
    
    const handleResetAllData = () => {
        // Clear all data and log out
        localStorage.clear();
        setJournalHistory([]);
        setIsPremium(false);
        setColorTheme('indigo');
        setThemeMode('system');
        setIsResetModalOpen(false);
        handleLogout();
    };

    const addJournalEntry = (entry: Omit<JournalEntry, 'date'>) => {
        const newEntry: JournalEntry = {
            ...entry,
            date: new Date().toISOString(),
        };
        setJournalHistory(prev => [...prev, newEntry]);
    };

    const streak = useMemo(() => {
        if (journalHistory.length === 0) {
            return 0;
        }

        const sortedHistory = [...journalHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const uniqueDays = sortedHistory.reduce((acc, entry) => {
            const dateStr = entry.date.substring(0, 10);
            if (!acc.includes(dateStr)) {
                acc.push(dateStr);
            }
            return acc;
        }, [] as string[]);

        if (uniqueDays.length === 0) {
            return 0;
        }

        // Fix: Appending 'T00:00:00' ensures date-only strings are parsed in local time, not UTC.
        const lastEntryDate = new Date(uniqueDays[0] + 'T00:00:00');
        if (!isToday(lastEntryDate) && !isYesterday(lastEntryDate)) {
            return 0; // Streak broken
        }

        let currentStreak = 1;
        for (let i = 1; i < uniqueDays.length; i++) {
            // Fix: Appending 'T00:00:00' ensures date-only strings are parsed in local time, not UTC.
            const currentDate = new Date(uniqueDays[i-1] + 'T00:00:00');
            const previousDate = new Date(uniqueDays[i] + 'T00:00:00');
            if (differenceInCalendarDays(currentDate, previousDate) === 1) {
                currentStreak++;
            } else {
                break; // Streak broken
            }
        }
        
        return currentStreak;
    }, [journalHistory]);

    const renderScreen = () => {
        switch (activeScreen) {
            case Screen.Home:
                return <HomeScreen addJournalEntry={addJournalEntry} currentUser={currentUser} onNavigate={setActiveScreen} />;
            case Screen.Progress:
                return <ProgressScreen journalHistory={journalHistory} streak={streak} isPremium={isPremium} onUpgradeRequest={() => setIsPremiumModalOpen(true)} />;
            case Screen.LiveConversation:
                return <LiveConversationScreen onBack={() => setActiveScreen(Screen.Home)} />;
            case Screen.Settings:
                return <SettingsScreen 
                            isPremium={isPremium} 
                            onUpgradeRequest={() => setIsPremiumModalOpen(true)} 
                            onLogout={handleLogout} 
                            onViewPrivacy={() => setActiveScreen(Screen.Privacy)} 
                            journalHistory={journalHistory} 
                            streak={streak}
                            onResetRequest={() => setIsResetModalOpen(true)}
                            colorTheme={colorTheme}
                            setColorTheme={setColorTheme}
                            themeMode={themeMode}
                            setThemeMode={setThemeMode}
                            currentUser={currentUser}
                        />;
            case Screen.Privacy:
                return <PrivacyPolicyScreen onBack={() => setActiveScreen(Screen.Settings)} />
            default:
                return <HomeScreen addJournalEntry={addJournalEntry} currentUser={currentUser} onNavigate={setActiveScreen} />;
        }
    };
    
    if (!currentUser) {
        return (
            <div className="bg-bkg-light dark:bg-bkg-dark w-screen h-screen">
                <LoginScreen onLogin={handleLogin} />
            </div>
        )
    }

    const isNavVisible = activeScreen !== Screen.Privacy && activeScreen !== Screen.LiveConversation;

    return (
        <div className="bg-bkg-light dark:bg-bkg-dark min-h-screen text-text-primary-light dark:text-text-primary-dark font-sans">
            <main className={`max-w-md mx-auto p-4 ${isNavVisible ? 'pb-28' : ''}`}>
                {renderScreen()}
            </main>
            {isNavVisible && <BottomNav items={NAV_ITEMS} activeScreen={activeScreen} setActiveScreen={setActiveScreen} />}
            <PremiumModal 
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onUpgrade={() => {
                    setIsPremium(true);
                    setIsPremiumModalOpen(false);
                }}
            />
            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetAllData}
                title="Reset All Data?"
                message="This action is irreversible. All your journal entries, streaks, and achievements will be permanently deleted."
                confirmText="Yes, Reset Data"
            />
        </div>
    );
};

export default App;