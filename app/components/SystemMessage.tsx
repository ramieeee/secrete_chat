'use client';

import { useTheme } from '../contexts/ThemeContext';

interface SystemMessageProps {
    message: string;
}

export default function SystemMessage({ message }: SystemMessageProps) {
    const { theme_colors } = useTheme();
    
    return (
        <div className="flex justify-center mb-4">
            <div className="neumorphic-message rounded-full px-4 py-2">
                <p className="text-sm text-center" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{message}</p>
            </div>
        </div>
    );
}

