'use client';

import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SystemMessage from './SystemMessage';
import UserListChip from './UserListChip';

interface Message {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper';
    nickname: string;
    message?: string;
    timestamp: number;
    reason?: string;
    user_list?: string[];
    target_nickname?: string;
    image_data?: string;
}

interface ChatRoomProps {
    nickname: string;
    onDisconnect: (errorMessage?: string) => void;
}

export default function ChatRoom({ nickname, onDisconnect }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [user_list, setUserList] = useState<string[]>([]);
    const ws_ref = useRef<WebSocket | null>(null);
    const messages_end_ref = useRef<HTMLDivElement>(null);
    const onDisconnect_ref = useRef(onDisconnect);
    
    useEffect(() => {
        onDisconnect_ref.current = onDisconnect;
    }, [onDisconnect]);

    useEffect(() => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            return;
        }

        let is_mounted = true;
        let ws: WebSocket | null = null;

        const connectWebSocket = () => {
            if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
                return;
            }

            try {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const hostname = window.location.hostname;
                const ws_port = process.env.NEXT_PUBLIC_WS_PORT || '9999';
                const ws_url = `${protocol}//${hostname}:${ws_port}`;
                ws = new WebSocket(ws_url);
                ws_ref.current = ws;

                ws.onopen = () => {
                    console.log('웹소켓 연결됨');
                    if (is_mounted && ws && ws.readyState === WebSocket.OPEN) {
                        setIsConnected(true);
                        setConnectionError(null);
                        ws.send(JSON.stringify({
                            type: 'join',
                            nickname: nickname
                        }));
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const message: Message = JSON.parse(event.data);
                        if (message.type === 'join_rejected') {
                            console.log('입장 거부:', message.reason);
                            if (is_mounted && ws) {
                                ws.close();
                                onDisconnect_ref.current(message.reason || '입장이 거부되었습니다.');
                            }
                            return;
                        }
                        if (message.type === 'user_list' && message.user_list) {
                            if (is_mounted) {
                                setUserList(message.user_list);
                            }
                            return;
                        }
                        if (is_mounted) {
                            setMessages((prev) => [...prev, message]);
                        }
                    } catch (error) {
                        console.error('메시지 파싱 오류:', error);
                    }
                };

                ws.onerror = (error) => {
                    console.error('웹소켓 오류:', error);
                    if (is_mounted) {
                        setIsConnected(false);
                        setConnectionError('웹소켓 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
                    }
                };

                ws.onclose = (event) => {
                    console.log('웹소켓 연결 종료', event.code, event.reason);
                    if (is_mounted) {
                        setIsConnected(false);
                        if (ws_ref.current === ws) {
                            ws_ref.current = null;
                        }
                        
                        if (event.code === 1008) {
                            const reason = event.reason || '입장이 거부되었습니다.';
                            onDisconnect_ref.current(reason);
                            return;
                        }
                    }
                };
            } catch (error) {
                console.error('웹소켓 생성 오류:', error);
                if (is_mounted) {
                    setIsConnected(false);
                }
            }
        };

        connectWebSocket();

        return () => {
            is_mounted = false;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1000, '컴포넌트 언마운트');
            }
            if (ws_ref.current === ws) {
                ws_ref.current = null;
            }
        };
    }, [nickname]);

    useEffect(() => {
        messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const last_message = messages[messages.length - 1];
        if (last_message && last_message.type === 'message' && last_message.nickname !== nickname) {
            const original_title = document.title;
            document.title = 'New message - chat programme';
            
            const timeout = setTimeout(() => {
                document.title = original_title;
            }, 3000);
            
            return () => clearTimeout(timeout);
        }
    }, [messages, nickname]);

    useEffect(() => {
        const cleanup_old_messages = () => {
            setMessages((prev) => {
                const now = Date.now();
                const five_minutes = 5 * 60 * 1000;
                
                return prev.filter((msg) => {
                    if (msg.type === 'message' || msg.type === 'whisper') {
                        const message_age = now - msg.timestamp;
                        return message_age < five_minutes;
                    }
                    return true;
                });
            });
        };

        const interval = setInterval(cleanup_old_messages, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = (message: string, target_nickname?: string, image_data?: string) => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            try {
                if (target_nickname) {
                    ws_ref.current.send(JSON.stringify({
                        type: 'whisper',
                        message: message,
                        target_nickname: target_nickname,
                        image_data: image_data
                    }));
                    console.log('귓속말 전송:', message, '->', target_nickname, image_data ? '(이미지 포함)' : '');
                } else {
                    ws_ref.current.send(JSON.stringify({
                        type: 'message',
                        message: message,
                        image_data: image_data
                    }));
                    console.log('메시지 전송:', message, image_data ? '(이미지 포함)' : '');
                }
            } catch (error) {
                console.error('메시지 전송 실패:', error);
                setConnectionError('메시지 전송에 실패했습니다.');
            }
        } else {
            console.error('웹소켓이 연결되지 않았습니다. 상태:', ws_ref.current?.readyState);
            setConnectionError('웹소켓이 연결되지 않았습니다.');
        }
    };

    const handleDisconnect = () => {
        if (ws_ref.current) {
            ws_ref.current.close();
        }
        onDisconnect();
    };

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden">
            <div className="relative bg-slate-950 border-b border-slate-800 px-2 py-2 md:px-4 md:py-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <h1 className="text-base md:text-xl font-bold text-slate-300">
                            chat programme
                        </h1>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-xs md:text-sm text-slate-500 font-mono">
                            {isConnected ? '[ONLINE]' : connectionError ? '[ERROR]' : '[CONNECTING...]'}
                        </span>
                        <UserListChip user_count={user_list.length} user_list={user_list} />
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-xs md:text-sm text-slate-400 font-mono hidden sm:inline">
                            &gt; {nickname}
                        </span>
                        <button
                            onClick={handleDisconnect}
                            className="px-2 py-1 text-xs md:text-sm text-red-400 hover:text-red-300 hover:bg-slate-900 rounded border border-slate-700 transition-colors md:px-3"
                        >
                            [EXIT]
                        </button>
                    </div>
                </div>
            </div>

            {connectionError && (
                <div className="relative bg-red-950/30 border-l-4 border-red-600 text-red-400 p-4 mx-4 mt-4 rounded">
                    <p className="font-bold font-mono">[ERROR]</p>
                    <p className="text-sm">{connectionError}</p>
                    <p className="text-xs mt-2 text-red-500/80 font-mono">웹소켓 서버 실행: <code className="bg-slate-900 px-1 rounded">npm run ws</code></p>
                </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-6 relative">
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg, index) => {
                        const unique_key = `${msg.type}-${msg.timestamp}-${msg.nickname}-${index}`;
                        if (msg.type === 'message' && (msg.message || msg.image_data)) {
                            return (
                                <ChatMessage
                                    key={unique_key}
                                    nickname={msg.nickname}
                                    message={msg.message || ''}
                                    timestamp={msg.timestamp}
                                    isOwn={msg.nickname === nickname}
                                    image_data={msg.image_data}
                                />
                            );
                        } else if (msg.type === 'whisper' && (msg.message || msg.image_data) && msg.target_nickname) {
                            const is_sender = msg.nickname === nickname;
                            const is_receiver = msg.target_nickname.toLowerCase() === nickname.toLowerCase();
                            
                            if (is_sender || is_receiver) {
                                return (
                                    <ChatMessage
                                        key={unique_key}
                                        nickname={msg.nickname}
                                        message={msg.message || ''}
                                        timestamp={msg.timestamp}
                                        isOwn={is_sender}
                                        isWhisper={true}
                                        target_nickname={msg.target_nickname}
                                        current_nickname={nickname}
                                        image_data={msg.image_data}
                                    />
                                );
                            }
                            return null;
                        } else if (msg.type === 'join') {
                            return (
                                <SystemMessage
                                    key={unique_key}
                                    message={`${msg.nickname}님이 입장했습니다.`}
                                />
                            );
                        } else if (msg.type === 'leave') {
                            return (
                                <SystemMessage
                                    key={unique_key}
                                    message={`${msg.nickname}님이 퇴장했습니다.`}
                                />
                            );
                        }
                        return null;
                    })}
                    <div ref={messages_end_ref} />
                </div>
            </div>

            <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={!isConnected}
                user_list={user_list}
                current_nickname={nickname}
            />
        </div>
    );
}

