'use client';

import { useState } from 'react';
import { APP_VERSION } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface NicknameInputProps {
    onJoin: (nickname: string) => void;
    errorMessage?: string | null;
}

export default function NicknameInput({ onJoin, errorMessage }: NicknameInputProps) {
    const { theme_colors } = useTheme();
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed_nickname = nickname.trim();
        if (trimmed_nickname) {
            onJoin(trimmed_nickname);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen neumorphic relative overflow-hidden" style={{ backgroundColor: theme_colors.chat_background }}>
            <div className="fixed bottom-2 right-2 text-xs z-40" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                v{APP_VERSION}
            </div>
            <div className="relative neumorphic rounded-3xl p-8 w-full max-w-md mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-sm mb-2" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        Let us Chat!
                    </h1>
                    <p className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>닉네임을 입력하고 네트워크에 접속하세요</p>
                </div>
                {errorMessage && (
                    <div className="mb-4 p-3 neumorphic-message rounded-2xl">
                        <p className="text-xs" style={{ color: '#f04c4d', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{errorMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="neumorphic-input rounded-full px-4 py-2">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="닉네임을 입력하세요"
                            className="w-full bg-transparent focus:outline-none text-xs placeholder-opacity-70"
                            style={{ 
                                color: theme_colors.input_text,
                                fontFamily: 'var(--font-sans)', 
                                fontWeight: 400 
                            }}
                            maxLength={20}
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full neumorphic-button py-2.5 rounded-full text-xs transition-all"
                        style={{ 
                            color: theme_colors.input_text,
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 500 
                        }}
                    >
                        접속하기
                    </button>
                </form>
            </div>
        </div>
    );
}

