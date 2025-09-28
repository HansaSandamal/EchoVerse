import React, { useState, useEffect } from 'react';
import { scheduleSmartReminders, testNotification, cancelAllReminders } from '../../services/notificationService';
import { JournalEntry, ColorTheme, ThemeMode, User } from '../../types';
import { AIStatus } from '../../App'; // Import AIStatus type

interface SettingsScreenProps {
    isPremium: boolean;
    onUpgradeRequest: () => void;
    onLogout: () => void;
    onViewPrivacy: () => void;
    onResetRequest: () => void;
    journalHistory: JournalEntry[];
    streak: number;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    currentUser: User | null;
    aiStatus: AIStatus;
}

const ThemeOption: React.FC<{
    theme: ColorTheme;
    name: string;
    gradient: string;
    isActive: boolean;
    isLocked: boolean;
    onSelect: () => void;
}> = ({ theme, name, gradient, isActive, isLocked, onSelect }) => (
    <div className="text-center">
        <button
            onClick={onSelect}
            className={`w-16 h-16 rounded-full ${gradient} border-2 transition-all duration-200 ${isActive ? 'border-accent-light dark:border-accent-dark scale-110' : 'border-transparent'}`}
            disabled={isLocked}
        >
            {isLocked && (
                <div className="w-full h-full bg-black/50 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
            )}
        </button>
        <p className={`mt-2 text-sm font-medium ${isActive ? 'text-text-primary-light dark:text-text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>{name}</p>
    </div>
);

const ModeOption: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-center py-2 px-3 rounded-md text-sm font-semibold transition-colors ${isActive ? 'bg-accent-light dark:bg-accent-dark text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
        {label}
    </button>
);


const SettingsScreen: React.FC<SettingsScreenProps> = ({
    isPremium,
    onUpgradeRequest,
    onLogout,
    onViewPrivacy,
    onResetRequest,
    journalHistory,
    streak,
    colorTheme,
    setColorTheme,
    themeMode,
    setThemeMode,
    currentUser,
    aiStatus
}) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState<string | null>(null);

    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'granted') {
            setNotificationsEnabled(true);
        }
        return () => { cancelAllReminders(); };
    }, []);

    useEffect(() => {
        if (notificationsEnabled) {
            const time = scheduleSmartReminders({ journalHistory, streak });
            setReminderTime(time);
        } else {
            cancelAllReminders();
            setReminderTime(null);
        }
    }, [notificationsEnabled, journalHistory, streak]);


    const handleNotificationToggle = async () => {
        if (notificationsEnabled) {
            setNotificationsEnabled(false);
        } else {
            if (!('Notification' in window)) {
                alert("This browser does not support desktop notifications.");
                return;
            }
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
            } else {
                alert("Notification permissions have been denied.");
            }
        }
    };
    
    const handleThemeSelect = (theme: ColorTheme) => {
        const isThemePremium = theme !== 'indigo';
        if (isThemePremium && !isPremium) {
            onUpgradeRequest();
        } else {
            setColorTheme(theme);
        }
    };

    const renderAIStatus = () => {
        switch (aiStatus) {
            case 'available':
                return (
                    <div className="flex items-center justify-center p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-semibold text-green-800 dark:text-green-300">AI Service: Connected</span>
                    </div>
                );
            case 'unavailable':
                 return (
                    <div className="flex items-center justify-center p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="text-sm font-semibold text-red-800 dark:text-red-300">AI Service: Unavailable</span>
                    </div>
                );
            case 'checking':
            default:
                return (
                     <div className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700/30">
                        <svg className="animate-spin h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Service: Checking...</span>
                    </div>
                );
        }
    }


    return (
        <div className="space-y-8 animate-fade-in-up">
            <div>
                <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Settings</h1>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage your account and preferences.</p>
            </div>

            <div className="space-y-6">
                 {currentUser && (
                    <div className="p-4 bg-gradient-to-r from-content-light to-bkg-light dark:from-content-dark dark:to-bkg-dark rounded-xl flex items-center space-x-4">
                        <img src={currentUser.photoURL} alt="Profile" className="w-16 h-16 rounded-full" />
                        <div>
                            <h2 className="font-semibold text-xl text-text-primary-light dark:text-text-primary-dark">{currentUser.name}</h2>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{currentUser.email}</p>
                        </div>
                    </div>
                )}
                
                <div className="p-4 bg-content-light dark:bg-content-dark rounded-xl">
                    <h2 className="font-semibold text-lg mb-3 text-text-primary-light dark:text-text-primary-dark">Account</h2>
                    <div className="mb-3">{renderAIStatus()}</div>
                    {isPremium ? (
                         <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-500/10 rounded-lg">
                            <p className="font-medium text-green-700 dark:text-green-300">Premium Active ✨</p>
                            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">You have access to all features.</span>
                        </div>
                    ) : (
                        <button onClick={onUpgradeRequest} className="w-full p-4 bg-accent-light dark:bg-accent-dark hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover rounded-lg text-white font-bold transition-colors active:animate-button-press">
                            Upgrade to Premium
                        </button>
                    )}
                </div>

                <div className="p-4 bg-content-light dark:bg-content-dark rounded-xl">
                     <h2 className="font-semibold text-lg text-text-primary-light dark:text-text-primary-dark">Appearance</h2>
                     <div className="mt-4">
                        <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-3">Color Theme</h3>
                        <div className="flex justify-around">
                            <ThemeOption theme="indigo" name="Indigo" gradient="bg-gradient-to-br from-slate-500 to-indigo-500" isActive={colorTheme === 'indigo'} isLocked={false} onSelect={() => handleThemeSelect('indigo')} />
                            <ThemeOption theme="forest" name="Forest" gradient="bg-gradient-to-br from-gray-500 to-emerald-500" isActive={colorTheme === 'forest'} isLocked={!isPremium} onSelect={() => handleThemeSelect('forest')} />
                            <ThemeOption theme="sunset" name="Sunset" gradient="bg-gradient-to-br from-stone-500 to-orange-500" isActive={colorTheme === 'sunset'} isLocked={!isPremium} onSelect={() => handleThemeSelect('sunset')} />
                        </div>
                     </div>
                     <div className="mt-6">
                        <h3 className="text-base font-medium text-text-primary-light dark:text-text-primary-dark mb-3">Mode</h3>
                         <div className="flex bg-bkg-light dark:bg-bkg-dark p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                            <ModeOption label="Light" isActive={themeMode === 'light'} onClick={() => setThemeMode('light')} />
                            <ModeOption label="Dark" isActive={themeMode === 'dark'} onClick={() => setThemeMode('dark')} />
                            <ModeOption label="System" isActive={themeMode === 'system'} onClick={() => setThemeMode('system')} />
                        </div>
                     </div>
                </div>

                <div className="p-4 bg-content-light dark:bg-content-dark rounded-xl">
                    <h2 className="font-semibold text-lg mb-3 text-text-primary-light dark:text-text-primary-dark">Notifications</h2>
                     <div className="flex items-center justify-between">
                        <span className="text-text-primary-light dark:text-text-primary-dark">Smart Reminders</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationToggle} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-light dark:peer-checked:bg-accent-dark"></div>
                        </label>
                    </div>
                    {notificationsEnabled && reminderTime && (
                         <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-2">
                             <p>Next reminder scheduled around {reminderTime}.</p>
                             <button onClick={testNotification} className="text-accent-light dark:text-accent-dark hover:underline mt-1">Send test notification</button>
                         </div>
                    )}
                </div>

                <div className="p-4 bg-content-light dark:bg-content-dark rounded-xl">
                    <h2 className="font-semibold text-lg mb-3 text-text-primary-light dark:text-text-primary-dark">About</h2>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        <button onClick={onViewPrivacy} className="w-full text-left py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md text-text-primary-light dark:text-text-primary-dark transition-colors">Privacy Policy</button>
                         <a href="mailto:support@echoverse.app" className="block w-full text-left py-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-md text-text-primary-light dark:text-text-primary-dark transition-colors">Contact Support</a>
                    </div>
                </div>

                 <div className="p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl">
                    <h2 className="font-semibold text-lg mb-2 text-red-700 dark:text-red-300">Danger Zone</h2>
                     <button onClick={onResetRequest} className="w-full p-3 bg-red-200 dark:bg-red-600/30 hover:bg-red-300 dark:hover:bg-red-600/50 text-red-800 dark:text-red-200 font-bold rounded-lg transition-colors active:animate-button-press">
                        Reset All Data
                    </button>
                </div>

                 <div className="p-4 bg-content-light dark:bg-content-dark rounded-xl">
                    <button onClick={onLogout} className="w-full p-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-text-primary-light dark:text-text-primary-dark font-bold rounded-lg transition-colors active:animate-button-press">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
