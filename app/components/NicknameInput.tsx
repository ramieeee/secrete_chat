'use client';

import { useRef, useState } from 'react';
import { APP_VERSION } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface NicknameInputProps {
    onJoin: (nickname: string, server_url: string, password: string) => void;
    errorMessage?: string | null;
}

export default function NicknameInput({ onJoin, errorMessage }: NicknameInputProps) {
    const { theme_colors } = useTheme();
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const password_input_ref = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed_nickname = nickname.trim();
        if (trimmed_nickname && password.trim()) {
            onJoin(trimmed_nickname, window.location.origin, password);
        }
    };

    const can_submit = nickname.trim().length > 0 && password.trim().length > 0;

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
                    <p className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>닉네임을 입력하고 대화를 시작하세요</p>
                </div>
                {errorMessage && (
                    <div className="mb-4 p-3 neumorphic-message rounded-2xl">
                        <p className="text-xs" style={{ color: '#f04c4d', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{errorMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs mb-1.5" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                            닉네임
                        </label>
                        <div className="neumorphic-input rounded-full px-4 py-2">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        password_input_ref.current?.focus();
                                    }
                                }}
                                placeholder="닉네임을 입력하세요"
                                className="w-full bg-transparent focus:outline-none text-xs placeholder-opacity-70"
                                style={{ 
                                    color: theme_colors.input_text,
                                    fontFamily: 'var(--font-sans)', 
                                    fontWeight: 400 
                                }}
                                maxLength={20}
                                autoCapitalize="none"
                                autoCorrect="off"
                                enterKeyHint="next"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs mb-1.5" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                            비밀번호
                        </label>
                        <div className="neumorphic-input rounded-full px-4 py-2">
                            <input
                                ref={password_input_ref}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full bg-transparent focus:outline-none text-xs placeholder-opacity-70"
                                style={{ 
                                    color: theme_colors.input_text,
                                    fontFamily: 'var(--font-sans)', 
                                    fontWeight: 400 
                                }}
                                autoCapitalize="none"
                                autoCorrect="off"
                                enterKeyHint="go"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!can_submit}
                        className="w-full py-3 rounded-full text-sm transition-all flex items-center justify-center gap-2"
                        style={{ 
                            background: can_submit ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #3c3c3c 0%, #2d2d2d 100%)',
                            color: can_submit ? '#ffffff' : theme_colors.info_text,
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 600,
                            boxShadow: can_submit ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                            cursor: can_submit ? 'pointer' : 'not-allowed'
                        }}
                    >
                        접속하기
                    </button>
                </form>
            </div>
        </div>
    );
}
