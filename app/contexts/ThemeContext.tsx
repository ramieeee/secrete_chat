'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeColors, defaultThemeColors } from '../utils/theme_colors';

interface ThemeContextType {
    theme_colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme_colors] = useState<ThemeColors>(defaultThemeColors);

    useEffect(() => {
        updateCSSVariables(defaultThemeColors);
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

    return (
        <ThemeContext.Provider value={{ theme_colors }}>
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

