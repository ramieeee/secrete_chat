'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useMemo, useState, useEffect, useRef } from 'react';

interface Reaction {
    [emoji: string]: string[];
}

interface ReplyPreview {
    nickname: string;
    message: string;
    image_data?: boolean;
    file_name?: string;
    message_id?: string;
}

interface ChatMessageProps {
    nickname: string;
    message: string;
    timestamp: number;
    isOwn: boolean;
    isWhisper?: boolean;
    target_nickname?: string;
    image_data?: string;
    emoji?: string;
    file_data?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    message_id?: string;
    read_count?: number;
    total_users?: number;
    reactions?: Reaction;
    reply_to_preview?: ReplyPreview;
    is_highlighted?: boolean;
    show_nickname?: boolean;
    onReaction?: (message_id: string, emoji: string) => void;
    onDelete?: (message_id: string) => void;
    onReply?: (message_id: string) => void;
    onScrollToMessage?: (message_id: string) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👎'];

export default function ChatMessage({ 
    nickname, 
    message, 
    timestamp, 
    isOwn,
    isWhisper = false,
    target_nickname,
    image_data,
    emoji,
    file_data,
    file_name,
    file_size,
    file_type,
    message_id,
    read_count,
    total_users,
    reactions,
    reply_to_preview,
    is_highlighted,
    show_nickname = true,
    onReaction,
    onDelete,
    onReply,
    onScrollToMessage
}: ChatMessageProps) {
    const { theme_colors } = useTheme();
    const [show_image_modal, setShowImageModal] = useState(false);
    const [show_text_modal, setShowTextModal] = useState(false);
    const [image_scale, setImageScale] = useState(1);
    const [image_position, setImagePosition] = useState({ x: 0, y: 0 });
    const [is_dragging, setIsDragging] = useState(false);
    const [show_reaction_picker, setShowReactionPicker] = useState(false);
    const [hovered_reaction, setHoveredReaction] = useState<string | null>(null);
    const drag_start_ref = useRef({ x: 0, y: 0 });
    const reaction_picker_ref = useRef<HTMLDivElement>(null);

    const resetImageView = () => {
        setImageScale(1);
        setImagePosition({ x: 0, y: 0 });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowImageModal(false);
                resetImageView();
                setShowTextModal(false);
            }
        };

        if (show_image_modal || show_text_modal) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [show_image_modal, show_text_modal]);

    useEffect(() => {
        if (!is_dragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            setImagePosition({
                x: e.clientX - drag_start_ref.current.x,
                y: e.clientY - drag_start_ref.current.y
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [is_dragging]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reaction_picker_ref.current && !reaction_picker_ref.current.contains(event.target as Node)) {
                setShowReactionPicker(false);
            }
        };

        if (show_reaction_picker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show_reaction_picker]);
    
    // 사용자별 색상 생성 (어두운 색감, 배경과 구분)
    const user_color = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < nickname.length; i++) {
            hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
        }
        // HSL 색상 생성 (어두운 색감)
        const hue = hash % 360;
        const saturation = 40 + (hash % 20); // 40-60%
        const lightness = 45 + (hash % 15); // 45-60% (어두운 색감)
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }, [nickname]);
    
    // URL 감지 및 링크 변환
    const url_pattern = /(https?:\/\/[^\s]+)/g;
    const is_long_text = message.length > 200;
    const has_newlines = message.includes('\n');
    
    const isSingleEmoji = (text: string): boolean => {
        const trimmed = text.trim();
        if (!trimmed) return false;
        if (/[\p{L}\p{N}]/u.test(trimmed)) return false;
        const emoji_regex = /^\p{Emoji_Presentation}(\u200D\p{Emoji_Presentation})*$/u;
        return emoji_regex.test(trimmed);
    };
    
    const is_single_emoji = !emoji && message && isSingleEmoji(message);
    
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    const openFullTextModal = () => {
        setShowTextModal(true);
    };

    const openImageModal = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!image_data) return;
        setShowImageModal(true);
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'openUrl', url: url }, '*');
    };
    
    const renderMessageWithLinks = (text: string) => {
        if (!text) return null;
        
        const parts = text.split(url_pattern);
        return parts.map((part, index) => {
            const is_url = /^https?:\/\/[^\s]+$/.test(part);
            if (is_url) {
                const display_text = part.length > 50 ? `${part.substring(0, 50)}...` : part;
                return (
                    <a
                        key={index}
                        href={part}
                        className="underline hover:opacity-80 transition-opacity break-all cursor-pointer"
                        style={{ color: user_color, maxWidth: 'min(85vw, 600px)', display: 'inline-block', wordBreak: 'break-all' }}
                        onClick={(e) => handleLinkClick(e, part)}
                    >
                        {display_text}
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const handleReactionClick = (emoji: string) => {
        if (message_id && onReaction) {
            onReaction(message_id, emoji);
        }
        setShowReactionPicker(false);
    };

    const handleDeleteClick = () => {
        if (message_id && onDelete) {
            onDelete(message_id);
        }
    };

    const handleReplyClick = () => {
        if (message_id && onReply) {
            onReply(message_id);
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleFileDownload = () => {
        if (!file_data || !file_name) return;
        
        try {
            const byte_string = atob(file_data.split(',')[1]);
            const byte_array = new Uint8Array(byte_string.length);
            for (let i = 0; i < byte_string.length; i++) {
                byte_array[i] = byte_string.charCodeAt(i);
            }
            const blob = new Blob([byte_array], { type: file_type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file_name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);
        } catch {
            alert('파일 다운로드에 실패했습니다.');
        }
    };

    return (
        <>
        {show_image_modal && image_data && (
            <div 
                className="fixed inset-0 z-[100] flex flex-col"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
            >
                <div className="flex items-center justify-between p-2 bg-black/50">
                    <div className="flex gap-1">
                        <button
                            className="px-2 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-colors"
                            onClick={() => setImageScale(s => Math.max(0.5, s - 0.5))}
                            title="축소"
                        >
                            ➖
                        </button>
                        <button
                            className="px-2 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-colors min-w-[50px]"
                            onClick={resetImageView}
                            title="리셋"
                        >
                            {Math.round(image_scale * 100)}%
                        </button>
                        <button
                            className="px-2 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-colors"
                            onClick={() => setImageScale(s => Math.min(5, s + 0.5))}
                            title="확대"
                        >
                            ➕
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-colors flex items-center gap-1 ml-2"
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = image_data;
                                link.download = `image_${Date.now()}.png`;
                                link.click();
                            }}
                            title="다운로드"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                        <button
                            className="px-3 py-1.5 rounded-lg text-white text-xs hover:bg-white/20 transition-colors flex items-center gap-1"
                            onClick={() => {
                                const new_window = window.open(image_data, '_blank');
                                if (!new_window) {
                                    window.parent.postMessage({ type: 'openImage', url: image_data }, '*');
                                }
                            }}
                            title="새 창에서 열기"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                        </button>
                    </div>
                    <button
                        className="w-8 h-8 rounded-lg text-white text-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                        onClick={() => { setShowImageModal(false); resetImageView(); }}
                    >
                        ✕
                    </button>
                </div>
                <div 
                    className="flex-1 overflow-hidden relative flex items-center justify-center"
                    onWheel={(e) => {
                        e.preventDefault();
                        const delta = e.deltaY > 0 ? -0.2 : 0.2;
                        setImageScale(s => Math.max(0.5, Math.min(5, s + delta)));
                    }}
                    onMouseDown={(e) => {
                        if (e.button === 0) {
                            e.preventDefault();
                            setIsDragging(true);
                            drag_start_ref.current = {
                                x: e.clientX - image_position.x,
                                y: e.clientY - image_position.y
                            };
                        }
                    }}
                    onDoubleClick={() => {
                        if (image_scale === 1) {
                            setImageScale(2);
                            setImagePosition({ x: 0, y: 0 });
                        } else {
                            resetImageView();
                        }
                    }}
                    style={{ cursor: is_dragging ? 'grabbing' : 'grab' }}
                >
                    <div 
                        className="flex items-center justify-center"
                        style={{
                            transform: `translate(${image_position.x}px, ${image_position.y}px)`,
                            transition: is_dragging ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        <img 
                            src={image_data} 
                            alt="전체 이미지" 
                            className="object-contain select-none pointer-events-none"
                            style={{ 
                                transform: `scale(${image_scale})`,
                                maxWidth: '95%',
                                maxHeight: 'calc(100vh - 60px)',
                                transition: is_dragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
                <div className="text-center text-white/50 text-xs py-1 bg-black/30">
                    드래그: 이동 | 스크롤: 확대/축소 | 더블클릭: 2배 확대
                </div>
            </div>
        )}
        {show_text_modal && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                onClick={() => setShowTextModal(false)}
            >
                <div 
                    className="relative w-full max-w-3xl max-h-[80vh] rounded-2xl p-6 overflow-auto"
                    style={{ backgroundColor: theme_colors.chat_background }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute top-3 right-3 text-xl hover:opacity-70 transition-opacity"
                        onClick={() => setShowTextModal(false)}
                        style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)' }}
                    >
                        ✕
                    </button>
                    <pre 
                        className="text-sm whitespace-pre-wrap break-words"
                        style={{ 
                            color: theme_colors.input_text, 
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 400
                        }}
                    >
                        {message}
                    </pre>
                </div>
            </div>
        )}
        <div 
            id={message_id ? `message-${message_id}` : undefined}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} transition-all duration-500`}
            style={{
                backgroundColor: is_highlighted ? `${theme_colors.info_text}20` : 'transparent',
                borderRadius: '12px',
                padding: is_highlighted ? '4px' : '0',
                marginBottom: '4px',
                marginTop: (show_nickname && !isOwn) ? '8px' : '0'
            }}
        >
            <div className={`flex flex-col ${isOwn ? 'max-w-[85%] items-end' : 'max-w-[92%] items-start'}`}>
                {/* 닉네임 - 메시지 위에 표시 */}
                {!isOwn && show_nickname && (
                    <span className="whitespace-nowrap mb-0.5 ml-1" style={{ color: user_color, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '10px' }}>
                        {nickname}
                    </span>
                )}
                {isOwn && show_nickname && isWhisper && target_nickname && (
                    <span className="whitespace-nowrap mb-0.5 mr-1" style={{ color: '#f04c4d', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '10px' }}>
                        to: {target_nickname}
                    </span>
                )}
                <div className={`flex items-end gap-1 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                        className={`neumorphic-message px-3 py-1.5 rounded-2xl ${
                            isOwn ? 'rounded-tr-none' : 'rounded-tl-none'
                        }`}
                        style={{ 
                            color: theme_colors.input_text,
                            borderColor: isWhisper ? '#f04c4d' : 'transparent',
                            border: isWhisper ? '1px solid' : 'none',
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 400 
                        }}
                    >
                        {reply_to_preview && (
                            <button 
                                onClick={() => {
                                    if (reply_to_preview.message_id && onScrollToMessage) {
                                        onScrollToMessage(reply_to_preview.message_id);
                                    }
                                }}
                                className="mb-2 px-3 py-2 rounded-xl text-left w-full hover:opacity-90 transition-all cursor-pointer flex items-start gap-2"
                                style={{ 
                                    backgroundColor: `${theme_colors.info_text}15`,
                                    border: `1px solid ${theme_colors.info_text}30`
                                }}
                            >
                                <div 
                                    className="w-0.5 h-full min-h-[32px] rounded-full flex-shrink-0"
                                    style={{ backgroundColor: theme_colors.info_text }}
                                />
                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                    <span className="text-xs font-medium" style={{ color: theme_colors.info_text }}>
                                        ↩ {reply_to_preview.nickname}
                                    </span>
                                    <span 
                                        className="text-xs truncate"
                                        style={{ color: theme_colors.input_text, opacity: 0.8 }}
                                    >
                                        {reply_to_preview.message 
                                            ? (reply_to_preview.message.length > 40 
                                                ? reply_to_preview.message.substring(0, 40) + '...' 
                                                : reply_to_preview.message)
                                            : reply_to_preview.image_data 
                                                ? '📷 이미지' 
                                                : reply_to_preview.file_name 
                                                    ? `📎 ${reply_to_preview.file_name}` 
                                                    : ''}
                                    </span>
                                </div>
                            </button>
                        )}
                        {image_data && (
                            <div className="mb-1">
                                <img 
                                    src={image_data} 
                                    alt="전송된 이미지" 
                                    className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity select-none"
                                    style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
                                    onClick={openImageModal}
                                    draggable={false}
                                    onDragStart={(e) => e.preventDefault()}
                                    onMouseDown={(e) => e.preventDefault()}
                                />
                            </div>
                        )}
                        {file_data && file_name && (
                            <div className="mb-1">
                                <button
                                    onClick={handleFileDownload}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:opacity-80 w-full text-left"
                                    style={{
                                        backgroundColor: theme_colors.button_input_background,
                                        borderColor: theme_colors.info_text,
                                        color: theme_colors.input_text
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
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-medium truncate" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                            {file_name}
                                        </div>
                                        {file_size && (
                                            <div className="text-xs opacity-70" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                                                {formatFileSize(file_size)}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        )}
                        {emoji && !message && !image_data && (
                            <div className="text-4xl text-center py-1">
                                {emoji}
                            </div>
                        )}
                        {emoji && (message || image_data) && (
                            <span className="text-xl mr-1">{emoji}</span>
                        )}
                        {message && is_single_emoji && (
                            <div className="text-4xl text-center py-1">
                                {message.trim()}
                            </div>
                        )}
                        {message && !is_single_emoji && (
                            <div className="text-xs leading-relaxed" style={{ 
                                fontFamily: 'var(--font-sans)', 
                                fontWeight: 400,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                maxWidth: 'min(85vw, 600px)'
                            }}>
                                {is_long_text || has_newlines ? (
                                    <div>
                                        <div style={{ 
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 5,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {renderMessageWithLinks(message)}
                                        </div>
                                        <button
                                            onClick={openFullTextModal}
                                            className="mt-1 text-xs underline hover:opacity-80 transition-opacity"
                                            style={{ color: theme_colors.info_text }}
                                        >
                                            전체 텍스트 보기
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ maxWidth: 'min(85vw, 600px)', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                        {renderMessageWithLinks(message)}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* 리액션 - 메시지 버블 아래 */}
                        {reactions && Object.keys(reactions).length > 0 && (
                            <div className={`flex flex-wrap gap-0.5 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                {Object.entries(reactions).map(([reaction_emoji, users]) => (
                                    users.length > 0 && (
                                        <div 
                                            key={reaction_emoji}
                                            className="relative"
                                            onMouseEnter={() => setHoveredReaction(reaction_emoji)}
                                            onMouseLeave={() => setHoveredReaction(null)}
                                        >
                                            <button
                                                onClick={() => handleReactionClick(reaction_emoji)}
                                                className="flex items-center px-1 py-0 rounded-full text-xs transition-all hover:scale-105"
                                                style={{ 
                                                    backgroundColor: theme_colors.button_input_background,
                                                    border: `1px solid ${theme_colors.info_text}40`
                                                }}
                                            >
                                                <span className="text-xs">{reaction_emoji}</span>
                                                <span style={{ color: theme_colors.input_text, fontSize: '10px' }}>{users.length}</span>
                                            </button>
                                            {hovered_reaction === reaction_emoji && (
                                                <div 
                                                    className="absolute z-[60] px-2 py-1 rounded-lg shadow-lg text-xs whitespace-nowrap"
                                                    style={{ 
                                                        backgroundColor: theme_colors.button_input_background,
                                                        border: `1px solid ${theme_colors.info_text}`,
                                                        color: theme_colors.input_text,
                                                        bottom: '100%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    {users.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                    {/* 읽음 카운트 + 시간(hover) - 순서: 상대방(읽음-시간), 내꺼(시간-읽음) */}
                    <div className={`flex items-center gap-0.5 self-end ${isOwn ? 'flex-row-reverse' : ''}`}>
                        {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                            <span 
                                className="whitespace-nowrap"
                                style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '9px' }}
                            >
                                {read_count}
                            </span>
                        )}
                        <span 
                            className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity" 
                            style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '9px' }}
                        >
                            {formatTime(timestamp)}
                        </span>
                    </div>
                    {/* Action buttons - 직접 표시 */}
                    <div className="relative flex flex-row items-center gap-0 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                            onClick={() => setShowReactionPicker(!show_reaction_picker)}
                            className="p-0.5 hover:scale-110 transition-all"
                            style={{ color: theme_colors.info_text, fontSize: '11px' }}
                            title="리액션"
                        >
                            😀
                        </button>
                        <button
                            onClick={handleReplyClick}
                            className="p-0.5 hover:scale-110 transition-all"
                            style={{ color: theme_colors.info_text, fontSize: '11px' }}
                            title="답글"
                        >
                            ↩
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className="p-0.5 hover:scale-110 transition-all"
                            style={{ color: theme_colors.info_text, fontSize: '11px' }}
                            title="삭제"
                        >
                            🗑
                        </button>
                        {/* 리액션 피커 - 2줄 */}
                        {show_reaction_picker && (
                            <div 
                                ref={reaction_picker_ref}
                                className="absolute z-50 rounded-lg p-1 shadow-lg flex flex-col gap-0.5"
                                style={{ 
                                    backgroundColor: theme_colors.button_input_background,
                                    border: `1px solid ${theme_colors.info_text}`,
                                    [isOwn ? 'right' : 'left']: '100%',
                                    top: '0'
                                }}
                            >
                                <div className="flex">
                                    {REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReactionClick(emoji)}
                                            className="text-sm px-0.5 rounded transition-all hover:scale-110"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex">
                                    {REACTION_EMOJIS.slice(4).map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleReactionClick(emoji)}
                                            className="text-sm px-0.5 rounded transition-all hover:scale-110"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

