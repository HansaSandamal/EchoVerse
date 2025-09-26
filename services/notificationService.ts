import { JournalEntry } from '../types';
import { format } from 'date-fns';

interface SmartReminderParams {
    journalHistory: JournalEntry[];
    streak: number;
}

let reminderTimeout: number | undefined;

const getOptimalTime = (journalHistory: JournalEntry[]): string => {
    if (journalHistory.length < 3) {
        return '19:00'; // Default for new users
    }
    const hours = journalHistory.map(entry => new Date(entry.date).getHours());
    const hourFrequency: { [key: number]: number } = hours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
    }, {} as { [key: number]: number });

    const mostFrequentHour = Object.keys(hourFrequency).reduce((a, b) => 
        hourFrequency[parseInt(a)] > hourFrequency[parseInt(b)] ? a : b
    );
    
    return `${mostFrequentHour.toString().padStart(2, '0')}:00`;
};

const getPersonalizedMessage = (streak: number): string => {
    const milestoneStreaks = [3, 7, 14, 30, 50, 100];
    if (milestoneStreaks.includes(streak)) {
        return `You've hit a ${streak}-day streak! 🎉 That's amazing consistency. Keep the momentum going!`;
    }
    switch (true) {
        case (streak > 10):
            return `You're on a ${streak}-day streak! Incredible job prioritizing your well-being.`;
        case (streak > 3):
            return `You're on a ${streak}-day streak! Keep building this healthy habit.`;
        default:
            return "What's on your mind? Take a moment for yourself and record a new Echo.";
    }
};

const showNotification = (title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        console.log(`[MOCK NOTIFICATION] Title: ${title}, Body: ${options.body}`);
    }
};

export const scheduleSmartReminders = ({ journalHistory, streak }: SmartReminderParams): string => {
    cancelAllReminders();
    
    const optimalTime = getOptimalTime(journalHistory);
    const message = getPersonalizedMessage(streak);
    
    const [hour, minute] = optimalTime.split(':').map(Number);
    const now = new Date();
    let reminderDate = new Date();
    reminderDate.setHours(hour, minute, 0, 0);

    if (reminderDate < now) {
        reminderDate.setDate(reminderDate.getDate() + 1);
    }
    
    const delay = reminderDate.getTime() - now.getTime();

    console.log(`Smart reminder scheduled for ${format(reminderDate, 'h:mm a')}. Message: "${message}"`);

    reminderTimeout = window.setTimeout(() => {
        showNotification("EchoVerse Daily Journal", {
            body: message,
            icon: 'assets/icon.svg' 
        });
        // Schedule for next day
        scheduleSmartReminders({ journalHistory, streak });
    }, delay);

    return format(reminderDate, 'h:mm a');
};

export const testNotification = (): void => {
    console.log("Testing notification...");
    showNotification("EchoVerse Test Notification", {
        body: "This is how your daily reminder will look. Keep up the great work!",
        icon: 'assets/icon.svg'
    });
};


export const cancelAllReminders = (): void => {
    if (reminderTimeout) {
        clearTimeout(reminderTimeout);
        reminderTimeout = undefined;
        console.log("All reminders cancelled.");
    }
};