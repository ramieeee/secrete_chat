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
            <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                    <span className="text-xs text-slate-500 mb-1 px-2 font-mono font-bold">
                        &gt; {nickname}
                    </span>
                )}
                {isWhisper && (
                    <span className="text-xs text-purple-400 mb-1 px-2 font-mono font-bold">
                        {getWhisperLabel()}
                    </span>
                )}
                <div
                    className={`px-4 py-2 rounded-lg ${
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
                        <div className="mb-2">
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
                        <div className="text-6xl text-center py-2">
                            {emoji}
                        </div>
                    )}
                    {emoji && (message || image_data) && (
                        <span className="text-2xl mr-2">{emoji}</span>
                    )}
                    {message && <p className="text-sm break-words inline leading-relaxed" style={{ fontWeight: 400 }}>{message}</p>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-600 px-2 font-mono font-bold">
                        {formatTime(timestamp)}
                    </span>
                    {read_count !== undefined && total_users !== undefined && total_users > 1 && read_count > 0 && (
                        <span className="text-xs text-white px-2 font-mono font-bold">
                            {read_count}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

