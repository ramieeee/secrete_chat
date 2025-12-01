'use client';

import { useState, KeyboardEvent, useRef } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string, target_nickname?: string, image_data?: string) => void;
    disabled?: boolean;
    user_list: string[];
    current_nickname: string;
}

export default function ChatInput({ onSendMessage, disabled, user_list, current_nickname }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [selected_target, setSelectedTarget] = useState<string>('');
    const file_input_ref = useRef<HTMLInputElement>(null);
    const [is_uploading, setIsUploading] = useState(false);

    const available_users = user_list.filter(user => user.toLowerCase() !== current_nickname.toLowerCase());

    const handleSend = () => {
        const trimmed_message = message.trim();
        if (trimmed_message && !disabled) {
            if (selected_target) {
                onSendMessage(trimmed_message, selected_target);
            } else {
                onSendMessage(trimmed_message);
            }
            setMessage('');
        }
    };

    const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const blob = items[i].getAsFile();
                if (blob) {
                    await uploadImage(blob);
                }
                return;
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            await uploadImage(file);
        }
        if (file_input_ref.current) {
            file_input_ref.current.value = '';
        }
    };

    const uploadImage = async (file: File) => {
        if (disabled || is_uploading) return;

        const max_size = 5 * 1024 * 1024;
        if (file.size > max_size) {
            alert('이미지 크기는 5MB 이하여야 합니다.');
            return;
        }

        setIsUploading(true);
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                
                if (selected_target) {
                    onSendMessage('', selected_target, result);
                } else {
                    onSendMessage('', undefined, result);
                }
                setIsUploading(false);
            };

            reader.onerror = () => {
                console.error('이미지 읽기 오류');
                alert('이미지를 읽는데 실패했습니다.');
                setIsUploading(false);
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('이미지 처리 오류:', error);
            alert('이미지 처리에 실패했습니다.');
            setIsUploading(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative border-t border-slate-800 bg-slate-950 p-2 md:p-4">
            <div className="flex gap-1 md:gap-2 max-w-4xl mx-auto">
                <select
                    value={selected_target}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    disabled={disabled || available_users.length === 0}
                    className="px-2 py-2 md:px-3 md:py-3 rounded bg-slate-900 border border-slate-700 focus:border-slate-600 focus:outline-none text-slate-200 disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors font-mono text-xs"
                >
                    <option value="">전체</option>
                    {available_users.map((user) => (
                        <option key={user} value={user}>
                            {user}
                        </option>
                    ))}
                </select>
                <input
                    type="file"
                    ref={file_input_ref}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className={`px-2 py-2 md:px-3 md:py-3 rounded bg-slate-900 border border-slate-700 text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors font-mono text-xs flex items-center ${disabled || is_uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    📷
                </label>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder={selected_target ? `${selected_target}에게 귓속말...` : "메시지를 입력하세요... (Ctrl+V로 이미지 붙여넣기)"}
                    disabled={disabled}
                    className="flex-1 px-2 py-2 md:px-4 md:py-3 rounded bg-slate-900 border border-slate-700 focus:border-slate-600 focus:outline-none text-slate-200 placeholder-slate-600 disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors font-mono text-sm md:text-base"
                    maxLength={500}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || !message.trim()}
                    className="px-3 py-2 md:px-6 md:py-3 bg-slate-800 text-slate-200 rounded font-bold hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors font-mono text-xs md:text-base"
                >
                    <span className="hidden md:inline">[SEND]</span>
                    <span className="md:hidden">전송</span>
                </button>
            </div>
            {is_uploading && (
                <div className="text-xs text-slate-500 text-center mt-2 font-mono">
                    이미지 처리 중...
                </div>
            )}
        </div>
    );
}

