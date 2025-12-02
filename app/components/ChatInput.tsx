'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
    onSendMessage: (message: string, target_nickname?: string, image_data?: string, emoji?: string) => void;
    disabled?: boolean;
    user_list: string[];
    current_nickname: string;
}

export default function ChatInput({ onSendMessage, disabled, user_list, current_nickname }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [selected_target, setSelectedTarget] = useState<string>('');
    const [selected_emoji, setSelectedEmoji] = useState<string>('');
    const [show_emoji_picker, setShowEmojiPicker] = useState(false);
    const file_input_ref = useRef<HTMLInputElement>(null);
    const emoji_picker_ref = useRef<HTMLDivElement>(null);
    const [is_uploading, setIsUploading] = useState(false);

    const common_emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
        '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
        '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
        '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
        '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
        '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
        '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
        '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
        '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
        '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
        '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘',
        '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
        '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
        '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌'
    ];

    const available_users = user_list.filter(user => user.toLowerCase() !== current_nickname.toLowerCase());

    const handleSend = () => {
        const trimmed_message = message.trim();
        if ((trimmed_message || selected_emoji) && !disabled) {
            if (selected_target) {
                onSendMessage(trimmed_message, selected_target, undefined, selected_emoji);
            } else {
                onSendMessage(trimmed_message, undefined, undefined, selected_emoji);
            }
            setMessage('');
            setSelectedEmoji('');
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

    const handleEmojiClick = (emoji: string) => {
        setSelectedEmoji(emoji);
        setShowEmojiPicker(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emoji_picker_ref.current && !emoji_picker_ref.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (show_emoji_picker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show_emoji_picker]);

    return (
        <div className="relative border-t border-slate-800 bg-slate-950 p-2 md:p-4">
            <div className="flex gap-1 md:gap-2 max-w-4xl mx-auto">
                <select
                    value={selected_target}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    disabled={disabled || available_users.length === 0}
                    className="px-2 py-2 md:px-3 md:py-3 rounded bg-slate-900 border border-slate-700 focus:border-slate-600 focus:outline-none text-slate-200 disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors font-mono text-sm"
                    style={{ fontWeight: 500, paddingRight: 'calc(0.5rem - 10px)', paddingLeft: 'calc(0.5rem - 10px)' }}
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
                    className={`px-2 py-2 md:px-3 md:py-3 rounded bg-slate-900 border border-slate-700 text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors font-mono text-sm flex items-center ${disabled || is_uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ fontWeight: 500 }}
                >
                    📷
                </label>
                <div className="relative" ref={emoji_picker_ref}>
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!show_emoji_picker)}
                        disabled={disabled}
                        className={`px-2 py-2 md:px-3 md:py-3 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors font-mono text-center w-10 md:w-12 disabled:bg-slate-950 disabled:cursor-not-allowed ${selected_emoji ? 'border-slate-600' : ''}`}
                        style={{ fontWeight: 500 }}
                    >
                        {selected_emoji || '😀'}
                    </button>
                    {show_emoji_picker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg p-3 max-h-64 overflow-y-auto shadow-lg z-50 w-64 grid grid-cols-8 gap-1">
                            {common_emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl hover:bg-slate-800 rounded p-1 transition-colors hover:scale-110"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePaste}
                    placeholder={selected_target ? `${selected_target}에게 귓속말...` : "메시지를 입력하세요... (Ctrl+V로 이미지 붙여넣기)"}
                    disabled={disabled}
                    className="flex-1 px-2 py-2 md:px-4 md:py-3 rounded bg-slate-900 border border-slate-700 focus:border-slate-600 focus:outline-none text-slate-200 placeholder-slate-600 disabled:bg-slate-950 disabled:cursor-not-allowed transition-colors text-sm"
                    style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}
                    maxLength={500}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !selected_emoji)}
                    className="px-3 py-2 md:px-6 md:py-3 bg-slate-800 text-slate-200 rounded hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors font-mono text-sm"
                    style={{ fontWeight: 500 }}
                >
                    <span className="hidden md:inline">[SEND]</span>
                    <span className="md:hidden">전송</span>
                </button>
            </div>
            {is_uploading && (
                <div className="text-sm text-slate-500 text-center mt-2 font-mono" style={{ fontWeight: 500 }}>
                    이미지 처리 중...
                </div>
            )}
        </div>
    );
}

