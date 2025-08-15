import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [isMounted, setIsMounted] = useState(false);

    // Initialize theme from localStorage or prefer-color-scheme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        setIsMounted(true);
    }, []);

    // Apply theme changes when theme state changes
    useEffect(() => {
        if (!isMounted) return;

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme, isMounted]);

    // Toggle between light and dark theme
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme, isMounted };
};