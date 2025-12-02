'use client';

import { useState } from 'react';
import { APP_VERSION } from '../constants';

interface NicknameInputProps {
    onJoin: (nickname: string) => void;
    errorMessage?: string | null;
}

export default function NicknameInput({ onJoin, errorMessage }: NicknameInputProps) {
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed_nickname = nickname.trim();
        if (trimmed_nickname) {
            onJoin(trimmed_nickname);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black relative overflow-hidden">
            <div className="fixed bottom-2 right-2 text-sm text-slate-600" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                v{APP_VERSION}
            </div>
            <div className="relative bg-slate-950 rounded-lg p-8 w-full max-w-md border border-slate-700">
                <div className="text-center mb-6">
                    <h1 className="text-sm text-slate-300 mb-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        Let us Chat!
                    </h1>
                    <p className="text-sm text-slate-500" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>닉네임을 입력하고 네트워크에 접속하세요</p>
                </div>
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-950/30 border-l-4 border-red-600 text-red-400 rounded">
                        <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{errorMessage}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        className="w-full px-4 py-3 rounded bg-slate-900 border border-slate-700 focus:border-slate-600 focus:outline-none text-slate-200 placeholder-slate-600 transition-colors"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}
                        maxLength={20}
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full bg-slate-800 text-slate-200 py-3 rounded hover:bg-slate-700 transition-colors text-sm"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                    >
                        접속하기
                    </button>
                </form>
            </div>
        </div>
    );
}

