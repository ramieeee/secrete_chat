'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ChatInputProps {
    onSendMessage: (message: string, target_nickname?: string, image_data?: string, emoji?: string, file_data?: string, file_name?: string, file_size?: number, file_type?: string) => void;
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
        if (file) {
            if (file.type.startsWith('image/')) {
                await uploadImage(file);
            } else {
                await uploadFile(file);
            }
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

    const uploadFile = async (file: File) => {
        console.log('ChatInput: 파일 업로드 시작:', file.name, file.size, file.type);
        
        if (disabled || is_uploading) {
            console.warn('ChatInput: 업로드 불가 (disabled:', disabled, ', is_uploading:', is_uploading, ')');
            return;
        }

        const max_size = 10 * 1024 * 1024;
        if (file.size > max_size) {
            alert('파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        setIsUploading(true);
        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                console.log('ChatInput: 파일 읽기 완료, 데이터 크기:', result.length);
                
                if (selected_target) {
                    console.log('ChatInput: 귓속말로 파일 전송:', selected_target);
                    onSendMessage('', selected_target, undefined, undefined, result, file.name, file.size, file.type);
                } else {
                    console.log('ChatInput: 일반 메시지로 파일 전송');
                    onSendMessage('', undefined, undefined, undefined, result, file.name, file.size, file.type);
                }
                setIsUploading(false);
            };

            reader.onerror = (error) => {
                console.error('ChatInput: 파일 읽기 오류:', error);
                alert('파일을 읽는데 실패했습니다.');
                setIsUploading(false);
            };

            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    console.log(`ChatInput: 파일 읽기 진행: ${percent.toFixed(1)}%`);
                }
            };

            reader.readAsDataURL(file);
        } catch (error) {
            console.error('ChatInput: 파일 처리 오류:', error);
            alert('파일 처리에 실패했습니다.');
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
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className={`neumorphic-button w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${disabled || is_uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ 
                            color: theme_colors.input_text,
                            fontFamily: 'var(--font-sans)'
                        }}
                        title="파일 업로드"
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
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
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
                                <svg fill="currentColor" width="14" height="14" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><title>Ear</title><path d="M12,8a1.00067,1.00067,0,0,1,1,1,1,1,0,0,0,2,0,2.9995,2.9995,0,1,0-5.01758,2.2207c.01.0091.16113.16992.19336.21485a.9875.9875,0,0,1,0,1.11914.99952.99952,0,1,0,1.64844,1.13086,2.98332,2.98332,0,0,0-.00488-3.38867,7.12392,7.12392,0,0,0-.49122-.55665,1.05523,1.05523,0,0,1-.1582-.18164A1.00072,1.00072,0,0,1,12,8Zm0-6a7.0006,7.0006,0,0,0-6.76172,8.81152A.99989.99989,0,0,0,7.16992,10.294,5.00018,5.00018,0,1,1,17,9a5.11412,5.11412,0,0,1-.70508,2.56738L12.73145,19A2.00462,2.00462,0,0,1,11,20a2.027,2.027,0,0,1-2-2,1.99224,1.99224,0,0,1,.26855-.999,1.00065,1.00065,0,0,0-1.73242-1.002,3.9988,3.9988,0,1,0,6.96289,3.9336L18.0625,12.5A7.00044,7.00044,0,0,0,12,2Z"/></svg>
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
                    파일 처리 중...
                </div>
            )}
        </div>
    );
}
