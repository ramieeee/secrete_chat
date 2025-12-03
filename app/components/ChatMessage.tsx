'use client';

import { useTheme } from '../contexts/ThemeContext';

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
    
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
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
                                    onClick={() => {
                                        const new_window = window.open();
                                        if (new_window) {
                                            new_window.document.write(`<img src="${image_data}" style="max-width: 100%; height: auto;" />`);
                                        }
                                    }}
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
                        {message && <p className="text-xs break-words inline leading-relaxed" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>{message}</p>}
                    </div>
                    {!isOwn && (
                        <div className="flex flex-col items-start gap-0.5 flex-shrink-0">
                            <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                &gt; {nickname}
                            </span>
                            <div className="flex flex-row items-center gap-1">
                                <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    {formatTime(timestamp)}
                                </span>
                                {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                    <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                        {read_count}
                                    </span>
                                )}
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
                                {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                    <span className="text-xs whitespace-nowrap" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                        {read_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

