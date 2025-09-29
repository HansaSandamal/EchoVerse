import React from 'react';
import { Screen, NavItem } from '../../types.ts';

interface BottomNavProps {
    items: NavItem[];
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, activeScreen, setActiveScreen }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-content-light/80 dark:bg-content-dark/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-around items-center h-full">
                {items.map((item) => {
                    const isActive = activeScreen === item.screen;
                    return (
                        <button
                            key={item.screen}
                            onClick={() => setActiveScreen(item.screen)}
                            className={`flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200 ${isActive ? 'text-accent-light dark:text-accent-dark' : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-accent-light dark:hover:text-accent-dark'}`}
                        >
                            <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-accent-light/10 dark:bg-accent-dark/10' : 'bg-transparent'}`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-medium mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;