'use client';

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
    message_id,
    read_count,
    total_users
}: ChatMessageProps) {
    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getWhisperLabel = () => {
        if (!isWhisper || !target_nickname || !current_nickname) return null;
        
        if (isOwn) {
            return `귓속말: ${nickname} -> ${target_nickname}`;
        } else {
            return `귓속말: ${nickname} -> ${current_nickname}`;
        }
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex flex-col ${isOwn ? 'max-w-[85%] items-end' : 'max-w-[92%] items-start'}`}>
                {isWhisper && (
                    <span className="text-sm text-purple-400 mb-1 px-2" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        {getWhisperLabel()}
                    </span>
                )}
                <div className={`flex items-start gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                        className={`px-2 py-1 rounded-lg ${
                            isOwn
                                ? isWhisper
                                    ? 'bg-slate-800 text-slate-200 border border-purple-600 rounded-tr-none'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tr-none'
                                : isWhisper
                                    ? 'bg-slate-900 text-slate-300 border border-purple-600 rounded-tl-none'
                                    : 'bg-slate-900 text-slate-300 border border-slate-700 rounded-tl-none'
                        }`}
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}
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
                            <span className="text-xs text-slate-500 whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                &gt; {nickname}
                            </span>
                            <div className="flex flex-row items-center gap-1">
                                <span className="text-xs text-slate-600 whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    {formatTime(timestamp)}
                                </span>
                                {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                    <span className="text-xs text-white whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                        {read_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                    {isOwn && (
                        <div className="flex flex-row items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-slate-600 whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                {formatTime(timestamp)}
                            </span>
                            {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                                <span className="text-xs text-white whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                    {read_count}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

