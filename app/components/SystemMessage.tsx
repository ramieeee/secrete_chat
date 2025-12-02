'use client';

import { useTheme } from '../contexts/ThemeContext';

interface SystemMessageProps {
    message: string;
}

export default function SystemMessage({ message }: SystemMessageProps) {
    const { theme_colors } = useTheme();
    
    return (
        <div className="flex justify-center mb-4">
            <div className="border rounded-full px-4 py-2" style={{ backgroundColor: theme_colors.button_input_background, borderColor: theme_colors.info_text }}>
                <p className="text-sm text-center" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{message}</p>
            </div>
        </div>
    );
}

