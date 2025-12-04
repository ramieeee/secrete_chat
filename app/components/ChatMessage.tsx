'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useMemo, useState, useEffect } from 'react';

interface ChatMessageProps {
    nickname: string;
    message: string;
    timestamp: number;
    isOwn: boolean;
    isWhisper?: boolean;
    target_nickname?: string;
    current_nickname?: string;
    image_data?: string;
    emoji?: string;
    file_data?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    message_id?: string;
    read_count?: number;
    total_users?: number;
}

export default function ChatMessage({ 
    nickname, 
    message, 
    timestamp, 
    isOwn,
    isWhisper = false,
    target_nickname,
    current_nickname,
    image_data,
    emoji,
    file_data,
    file_name,
    file_size,
    file_type,
    message_id,
    read_count,
    total_users
}: ChatMessageProps) {
    const { theme_colors } = useTheme();
    const [show_image_modal, setShowImageModal] = useState(false);
    const [show_text_modal, setShowTextModal] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowImageModal(false);
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

    const openImageModal = () => {
        // Extension(iframe) 환경인지 확인
        const is_in_iframe = window !== window.parent;
        
        if (is_in_iframe && image_data) {
            // Extension의 Webview로 메시지 전송 → Simple Browser로 열기
            window.parent.postMessage({ type: 'openImage', url: image_data }, '*');
        } else {
            setShowImageModal(true);
        }
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Extension(iframe) 환경인지 확인
        const is_in_iframe = window !== window.parent;
        
        if (is_in_iframe) {
            // Extension의 Webview로 메시지 전송 → Simple Browser로 열기
            window.parent.postMessage({ type: 'openUrl', url: url }, '*');
        } else {
            // 일반 브라우저에서는 새 탭으로 열기
            window.open(url, '_blank', 'noopener,noreferrer');
        }
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
        } catch (error) {
            console.error('파일 다운로드 오류:', error);
            alert('파일 다운로드에 실패했습니다.');
        }
    };

    return (
        <>
        {show_image_modal && image_data && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                onClick={() => setShowImageModal(false)}
            >
                <button
                    className="absolute top-4 right-4 text-white text-2xl hover:opacity-70 transition-opacity"
                    onClick={() => setShowImageModal(false)}
                    style={{ fontFamily: 'var(--font-sans)' }}
                >
                    ✕
                </button>
                <img 
                    src={image_data} 
                    alt="전체 이미지" 
                    className="max-w-[90vw] max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
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
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex flex-col ${isOwn ? 'max-w-[85%] items-end' : 'max-w-[92%] items-start'}`}>
                <div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                        className={`neumorphic-message px-4 py-2 rounded-3xl ${
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
                        {image_data && (
                            <div className="mb-1">
                                <img 
                                    src={image_data} 
                                    alt="전송된 이미지" 
                                    className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={openImageModal}
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
                        {message && (
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
                    </div>
                    {!isOwn && (
                        <div className="flex flex-col items-start gap-0.5 flex-shrink-0">
                            <span className="text-xs whitespace-nowrap" style={{ color: user_color, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                &gt; {nickname}
                            </span>
                            <div className="flex flex-row items-center gap-1">
                                <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    {formatTime(timestamp)}
                                </span>
                                <div className="flex flex-row items-center" style={{ minWidth: '6px' }}>
                                {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                    <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                        {read_count}
                                    </span>
                                )}
                                </div>
                            </div>
                        </div>
                    )}
                    {isOwn && (
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                            {isWhisper && target_nickname && (
                                <span className="text-xs whitespace-nowrap" style={{ color: '#f04c4d', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    to: {target_nickname}
                                </span>
                            )}
                            <div className="flex flex-row items-center gap-1">
                                <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    {formatTime(timestamp)}
                                </span>
                                <div className="flex flex-row items-center" style={{ minWidth: '6px' }}>
                                {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                    <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                        {read_count}
                                    </span>
                                )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}

