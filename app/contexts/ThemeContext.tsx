'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeColors, generateThemeColors, defaultThemeColors } from '../utils/theme_colors';

interface ThemeContextType {
    theme_colors: ThemeColors;
    selected_color: string;
    setSelectedColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [selected_color, setSelectedColorState] = useState<string>('#000000');
    const [theme_colors, setThemeColors] = useState<ThemeColors>(defaultThemeColors);

    useEffect(() => {
        const saved_color = localStorage.getItem('theme_color');
        if (saved_color) {
            setSelectedColorState(saved_color);
            const saved_theme = generateThemeColors(saved_color);
            setThemeColors(saved_theme);
            updateCSSVariables(saved_theme);
        } else {
            updateCSSVariables(defaultThemeColors);
        }
    }, []);

    const updateCSSVariables = (colors: ThemeColors) => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--theme-chat-background', colors.chat_background);
            document.documentElement.style.setProperty('--theme-input-bar-background', colors.input_bar_background);
            document.documentElement.style.setProperty('--theme-button-input-background', colors.button_input_background);
            document.documentElement.style.setProperty('--theme-input-text', colors.input_text);
            document.documentElement.style.setProperty('--theme-info-text', colors.info_text);
        }
    };

    const setSelectedColor = (color: string) => {
        setSelectedColorState(color);
        const new_theme = generateThemeColors(color);
        setThemeColors(new_theme);
        updateCSSVariables(new_theme);
        localStorage.setItem('theme_color', color);
    };

    return (
        <ThemeContext.Provider value={{ theme_colors, selected_color, setSelectedColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

