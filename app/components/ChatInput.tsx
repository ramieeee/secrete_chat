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
    const [show_whisper_menu, setShowWhisperMenu] = useState(false);
    const file_input_ref = useRef<HTMLInputElement>(null);
    const emoji_picker_ref = useRef<HTMLDivElement>(null);
    const whisper_menu_ref = useRef<HTMLDivElement>(null);
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
            if (whisper_menu_ref.current && !whisper_menu_ref.current.contains(event.target as Node)) {
                setShowWhisperMenu(false);
            }
        };

        if (show_emoji_picker || show_whisper_menu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show_emoji_picker, show_whisper_menu]);

    const has_content = message.trim().length > 0 || selected_emoji.length > 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 flex justify-center z-50" style={{ backgroundColor: 'transparent' }}>
            <div className="flex items-center gap-2 max-w-2xl w-full">
                {/* Input 박스 */}
                <div className="flex-1 relative">
                    <div className="neumorphic-input rounded-full px-3 py-1.5 flex items-center gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            onPaste={handlePaste}
                            placeholder={selected_target ? `${selected_target}에게 귓속말...` : "메시지를 입력하세요..."}
                            disabled={disabled}
                            className="flex-1 bg-transparent focus:outline-none disabled:cursor-not-allowed text-xs w-full"
                            style={{ 
                                color: theme_colors.input_text,
                                fontFamily: 'var(--font-sans)', 
                                fontWeight: 400 
                            }}
                            maxLength={500}
                        />
                        {/* 종이비행기 아이콘 - input 박스 안 오른쪽 */}
                        <button
                            onClick={handleSend}
                            disabled={disabled || !has_content}
                            className={`p-1 rounded-full transition-all ${has_content && !disabled ? 'opacity-100 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                            style={{ 
                                color: theme_colors.input_text,
                                fontFamily: 'var(--font-sans)'
                            }}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
                
                {/* 사진, 이모지, 귓속말 아이콘 - input 박스 바깥 오른쪽 */}
                <div className="flex items-center gap-2 relative">
                    {/* 사진 아이콘 */}
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
                        className={`neumorphic-button w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${disabled || is_uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ 
                            color: theme_colors.input_text,
                            fontFamily: 'var(--font-sans)'
                        }}
                    >
                        <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </label>
                    
                    {/* 이모지 아이콘 */}
                    <div className="relative" ref={emoji_picker_ref}>
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!show_emoji_picker)}
                            disabled={disabled}
                            className={`neumorphic-button w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed text-base`}
                            style={{ 
                                color: theme_colors.input_text,
                                fontFamily: 'var(--font-sans)'
                            }}
                        >
                            {selected_emoji || '😀'}
                        </button>
                        {show_emoji_picker && (
                            <div 
                                className="absolute bottom-full right-0 mb-2 neumorphic rounded-3xl p-4 max-h-64 overflow-y-auto z-50 w-[calc(100vw-2rem)] max-w-[320px] grid grid-cols-8 gap-2 expand-animation"
                                style={{ 
                                    backgroundColor: theme_colors.button_input_background,
                                    maxWidth: 'min(calc(100vw - 2rem), 320px)'
                                }}
                            >
                                {common_emojis.map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="text-xl rounded-full p-2 transition-all hover:scale-110"
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
                    
                    {/* 귓속말 아이콘 */}
                    {available_users.length > 0 && (
                        <div className="relative" ref={whisper_menu_ref}>
                            <button
                                type="button"
                                onClick={() => setShowWhisperMenu(!show_whisper_menu)}
                                disabled={disabled}
                                className={`neumorphic-button w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed ${selected_target ? 'opacity-100' : 'opacity-70'}`}
                                style={{ 
                                    color: selected_target ? '#DC143C' : theme_colors.input_text,
                                    fontFamily: 'var(--font-sans)'
                                }}
                            >
                                <svg 
                                    width="14" 
                                    height="14" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M12 3C10 3 8.5 4.5 8.5 6.5c0 1.5 0.5 2.5 1.5 3L8 18l4-1.5c0.5 0.2 1 0.2 1.5 0L18 18l-2-8.5c1-0.5 1.5-1.5 1.5-3 0-2-1.5-3.5-3.5-3.5z"></path>
                                    <path d="M9 7c0-0.5 0.2-0.8 0.5-1"></path>
                                    <path d="M15 7c0-0.5-0.2-0.8-0.5-1"></path>
                                </svg>
                            </button>
                            {show_whisper_menu && (
                                <div 
                                    className="absolute bottom-full right-0 mb-2 neumorphic rounded-2xl p-2 z-50 min-w-[160px] whisper-expand"
                                    style={{ 
                                        backgroundColor: theme_colors.button_input_background
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedTarget('');
                                            setShowWhisperMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors hover:bg-opacity-20"
                                        style={{ 
                                            color: theme_colors.input_text,
                                            fontFamily: 'var(--font-sans)',
                                            fontWeight: 500
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = theme_colors.chat_background;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                    >
                                        전체
                                    </button>
                                    {available_users.map((user) => (
                                        <button
                                            key={user}
                                            type="button"
                                            onClick={() => {
                                                setSelectedTarget(user);
                                                setShowWhisperMenu(false);
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs transition-colors"
                                            style={{ 
                                                color: selected_target === user ? '#DC143C' : theme_colors.input_text,
                                                fontFamily: 'var(--font-sans)',
                                                fontWeight: selected_target === user ? 600 : 500
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = theme_colors.chat_background;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            {user}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {is_uploading && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-sm mb-2" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                    이미지 처리 중...
                </div>
            )}
        </div>
    );
}
