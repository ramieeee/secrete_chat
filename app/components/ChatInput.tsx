'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ChatInputProps {
    onSendMessage: (message: string, target_nickname?: string, image_data?: string, emoji?: string) => void;
    disabled?: boolean;
    user_list: string[];
    current_nickname: string;
}

export default function ChatInput({ onSendMessage, disabled, user_list, current_nickname }: ChatInputProps) {
    const { theme_colors } = useTheme();
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
        <div className="relative border-t p-2 md:p-4" style={{ backgroundColor: theme_colors.input_bar_background, borderColor: theme_colors.info_text }}>
            <div className="flex gap-1 md:gap-2 max-w-4xl mx-auto">
                <select
                    value={selected_target}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    disabled={disabled || available_users.length === 0}
                    className="h-10 px-2 rounded border focus:outline-none disabled:cursor-not-allowed transition-colors text-sm"
                    style={{ 
                        backgroundColor: theme_colors.button_input_background,
                        borderColor: theme_colors.info_text,
                        color: theme_colors.input_text,
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 500 
                    }}
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
                    className={`h-10 px-2 rounded border cursor-pointer transition-colors text-sm flex items-center justify-center ${disabled || is_uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ 
                        backgroundColor: theme_colors.button_input_background,
                        borderColor: theme_colors.info_text,
                        color: theme_colors.input_text,
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 500 
                    }}
                >
                    📷
                </label>
                <div className="relative" ref={emoji_picker_ref}>
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!show_emoji_picker)}
                        disabled={disabled}
                        className={`h-10 w-10 rounded border transition-colors text-center disabled:cursor-not-allowed flex items-center justify-center ${selected_emoji ? '' : ''}`}
                        style={{ 
                            backgroundColor: theme_colors.button_input_background,
                            borderColor: selected_emoji ? theme_colors.input_text : theme_colors.info_text,
                            color: theme_colors.input_text,
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 500 
                        }}
                    >
                        {selected_emoji || '😀'}
                    </button>
                    {show_emoji_picker && (
                        <div 
                            className="absolute bottom-full left-0 mb-2 border rounded-lg p-2 md:p-3 max-h-64 overflow-y-auto shadow-lg z-50 w-[calc(100vw-2rem)] max-w-[280px] sm:max-w-[320px] grid grid-cols-8 gap-1 expand-animation"
                            style={{ 
                                backgroundColor: theme_colors.button_input_background,
                                borderColor: theme_colors.info_text,
                                maxWidth: 'min(calc(100vw - 2rem), 320px)'
                            }}
                        >
                            {common_emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="text-xl rounded p-1 transition-colors hover:scale-110"
                                    style={{ 
                                        backgroundColor: 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme_colors.chat_background;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
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
                    className="flex-1 h-10 px-2 rounded border focus:outline-none disabled:cursor-not-allowed transition-colors text-sm theme-input"
                    style={{ 
                        backgroundColor: theme_colors.button_input_background,
                        borderColor: theme_colors.info_text,
                        color: theme_colors.input_text,
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 400 
                    }}
                    maxLength={500}
                />
                <button
                    onClick={handleSend}
                    disabled={disabled || (!message.trim() && !selected_emoji)}
                    className="h-10 px-3 rounded disabled:cursor-not-allowed transition-colors text-sm"
                    style={{ 
                        backgroundColor: disabled || (!message.trim() && !selected_emoji) ? theme_colors.chat_background : theme_colors.button_input_background,
                        color: disabled || (!message.trim() && !selected_emoji) ? theme_colors.info_text : theme_colors.input_text,
                        borderColor: theme_colors.info_text,
                        border: '1px solid',
                        fontFamily: 'var(--font-sans)', 
                        fontWeight: 500 
                    }}
                >
                    <span className="hidden md:inline">[SEND]</span>
                    <span className="md:hidden">전송</span>
                </button>
            </div>
            {is_uploading && (
                <div className="text-sm text-center mt-2" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                    이미지 처리 중...
                </div>
            )}
        </div>
    );
}

