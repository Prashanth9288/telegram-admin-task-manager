import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        // Strict Manual Mode: Check localStorage, otherwise default to 'light'
        if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
            return localStorage.getItem('theme');
        }
        return 'light'; // Default to light mode
    });

    useEffect(() => {
        const root = window.document.documentElement;
        
        // Remove both potential classes to start fresh
        root.classList.remove('light', 'dark');
        
        // Add current theme
        root.classList.add(theme);
        
        // Save to local storage
        localStorage.setItem('theme', theme);
        
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};
