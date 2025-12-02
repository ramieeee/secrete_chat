'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface UserListChipProps {
    user_count: number;
    user_list: string[];
}

export default function UserListChip({ user_count, user_list }: UserListChipProps) {
    const { theme_colors } = useTheme();
    const [is_expanded, setIsExpanded] = useState(false);
    const container_ref = useRef<HTMLDivElement>(null);

    const toggle_expand = () => {
        setIsExpanded(!is_expanded);
    };

    useEffect(() => {
        const handle_click_outside = (event: MouseEvent) => {
            if (container_ref.current && !container_ref.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (is_expanded) {
            document.addEventListener('mousedown', handle_click_outside);
        }

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [is_expanded]);

    return (
        <div ref={container_ref} className="relative z-50">
            <button
                onClick={toggle_expand}
                className="neumorphic-button rounded-full px-3 py-1.5 text-sm"
                style={{ 
                    color: theme_colors.input_text,
                    fontFamily: 'var(--font-sans)', 
                    fontWeight: 500 
                }}
            >
                {user_count}명
            </button>
            
            {is_expanded && (
                <div 
                    className="absolute top-10 left-0 neumorphic rounded-3xl p-3 md:p-4 w-[calc(100vw-2rem)] max-w-[250px] sm:max-w-[300px] expand-animation"
                    style={{ 
                        backgroundColor: theme_colors.button_input_background,
                        maxWidth: 'min(calc(100vw - 2rem), 300px)'
                    }}
                >
                    <div className="mb-3 pb-2" style={{ borderBottom: `1px solid ${theme_colors.info_text}20` }}>
                        <h3 className="text-sm" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>접속 중인 사용자</h3>
                        <p className="text-sm mt-1" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>총 {user_count}명</p>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {user_list.map((user, index) => (
                            <div
                                key={index}
                                className="text-sm py-1 px-2 rounded-full neumorphic-message fade-in-animation"
                                style={{
                                    color: theme_colors.input_text,
                                    fontFamily: 'var(--font-sans)',
                                    fontWeight: 500,
                                    animationDelay: `${index * 0.05}s`,
                                    animationFillMode: 'both',
                                }}
                            >
                                &gt; {user}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

