'use client';

import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SystemMessage from './SystemMessage';
import UserListChip from './UserListChip';

interface Message {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper' | 'read_update';
    nickname: string;
    message?: string;
    timestamp: number;
    reason?: string;
    user_list?: string[];
    target_nickname?: string;
    image_data?: string;
    emoji?: string;
    message_id?: string;
    read_count?: number;
    total_users?: number;
}

interface ChatRoomProps {
    nickname: string;
    onDisconnect: (errorMessage?: string) => void;
}

export default function ChatRoom({ nickname, onDisconnect }: ChatRoomProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [user_list, setUserList] = useState<string[]>([]);
    const [show_scroll_button, setShowScrollButton] = useState(false);
    const ws_ref = useRef<WebSocket | null>(null);
    const messages_end_ref = useRef<HTMLDivElement>(null);
    const messages_container_ref = useRef<HTMLDivElement>(null);
    const onDisconnect_ref = useRef(onDisconnect);
    const reconnect_timeout_ref = useRef<NodeJS.Timeout | null>(null);
    const is_reconnecting_ref = useRef(false);
    const was_at_bottom_ref = useRef(true);
    const read_messages_ref = useRef<Set<string>>(new Set());
    const is_visible_ref = useRef(true);
    const messages_ref = useRef<Message[]>([]);
    const title_blink_interval_ref = useRef<NodeJS.Timeout | null>(null);
    
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

            if (is_reconnecting_ref.current) {
                return;
            }

            is_reconnecting_ref.current = true;

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
                        setIsJoined(false);
                        is_reconnecting_ref.current = false;
                        if (reconnect_timeout_ref.current) {
                            clearTimeout(reconnect_timeout_ref.current);
                            reconnect_timeout_ref.current = null;
                        }
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
                                setIsJoined(true);
                            }
                            return;
                        }
                        if (message.type === 'join' && message.nickname === nickname) {
                            if (is_mounted) {
                                setIsJoined(true);
                            }
                        }
                        if (message.type === 'read_update' && message.message_id) {
                            if (is_mounted) {
                                setMessages((prev) => {
                                    const updated = prev.map((msg) => {
                                        if (msg.message_id === message.message_id) {
                                            return { ...msg, read_count: message.read_count, total_users: message.total_users };
                                        }
                                        return msg;
                                    });
                                    messages_ref.current = updated;
                                    return updated;
                                });
                            }
                            return;
                        }
                        if (is_mounted) {
                            const container = messages_container_ref.current;
                            if (container) {
                                const scroll_height = container.scrollHeight;
                                const scroll_top = container.scrollTop;
                                const client_height = container.clientHeight;
                                const distance_from_bottom = scroll_height - scroll_top - client_height;
                                was_at_bottom_ref.current = distance_from_bottom <= 400;
                            }
                            
                            const new_message = {
                                ...message,
                                message_id: message.message_id || `${message.type}-${message.timestamp}-${message.nickname}-${Date.now()}`
                            };
                            
                            setMessages((prev) => {
                                const updated = [...prev, new_message];
                                messages_ref.current = updated;
                                
                                if (is_visible_ref.current && new_message.nickname !== nickname && new_message.message_id) {
                                    setTimeout(() => {
                                        if (!read_messages_ref.current.has(new_message.message_id)) {
                                            read_messages_ref.current.add(new_message.message_id);
                                            if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
                                                ws_ref.current.send(JSON.stringify({
                                                    type: 'read',
                                                    message_id: new_message.message_id
                                                }));
                                            }
                                        }
                                    }, 500);
                                }
                                
                                return updated;
                            });
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
                        setIsJoined(false);
                        if (ws_ref.current === ws) {
                            ws_ref.current = null;
                        }
                        
                        if (event.code === 1008) {
                            const reason = event.reason || '입장이 거부되었습니다.';
                            onDisconnect_ref.current(reason);
                            is_reconnecting_ref.current = false;
                            return;
                        }
                        
                        if (event.code === 1000) {
                            // 정상 종료 (서버에서 기존 연결을 닫은 경우 포함)
                            // 재연결을 시도하지 않음
                            is_reconnecting_ref.current = false;
                            return;
                        }
                        
                        if (is_mounted && event.code !== 1000 && event.code !== 1008) {
                            // 비정상 종료 - 재연결 시도
                            is_reconnecting_ref.current = false;
                            
                            // 재연결 전에 약간의 지연을 두어 서버가 기존 연결을 정리할 시간을 줌
                            reconnect_timeout_ref.current = setTimeout(() => {
                                if (is_mounted && (!ws_ref.current || ws_ref.current.readyState !== WebSocket.OPEN)) {
                                    setConnectionError('서버에 연결할 수 없습니다. 재연결 시도 중...');
                                    connectWebSocket();
                                }
                            }, 5000);
                        }
                    }
                };
            } catch (error) {
                console.error('웹소켓 생성 오류:', error);
                if (is_mounted) {
                    setIsConnected(false);
                    setConnectionError('서버에 연결할 수 없습니다. 재연결 시도 중...');
                    is_reconnecting_ref.current = false;
                    
                    reconnect_timeout_ref.current = setTimeout(() => {
                        if (is_mounted && (!ws_ref.current || ws_ref.current.readyState !== WebSocket.OPEN)) {
                            connectWebSocket();
                        }
                    }, 5000);
                }
            }
        };

        connectWebSocket();

        const check_connection_interval = setInterval(() => {
            if (is_mounted && (!ws_ref.current || ws_ref.current.readyState !== WebSocket.OPEN)) {
                if (!is_reconnecting_ref.current && !reconnect_timeout_ref.current) {
                    setConnectionError('서버에 연결할 수 없습니다. 재연결 시도 중...');
                    connectWebSocket();
                }
            }
        }, 10000);

        const handle_visibility_change = () => {
            const was_hidden = !is_visible_ref.current;
            is_visible_ref.current = !document.hidden;
            
            if (is_visible_ref.current && was_hidden) {
                const container = messages_container_ref.current;
                if (container) {
                    const scroll_height = container.scrollHeight;
                    const scroll_top = container.scrollTop;
                    const client_height = container.clientHeight;
                    const distance_from_bottom = scroll_height - scroll_top - client_height;
                    const is_at_bottom = distance_from_bottom < 100;
                    
                    if (is_at_bottom) {
                        if (title_blink_interval_ref.current) {
                            clearInterval(title_blink_interval_ref.current);
                            title_blink_interval_ref.current = null;
                            document.title = 'chat programme';
                        }
                    }
                }
            }
            
            if (is_visible_ref.current && ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
                messages_ref.current.forEach((msg) => {
                    if (msg.message_id && !read_messages_ref.current.has(msg.message_id) && msg.nickname !== nickname) {
                        read_messages_ref.current.add(msg.message_id);
                        ws_ref.current?.send(JSON.stringify({
                            type: 'read',
                            message_id: msg.message_id
                        }));
                    }
                });
            }
        };

        document.addEventListener('visibilitychange', handle_visibility_change);

        return () => {
            is_mounted = false;
            document.removeEventListener('visibilitychange', handle_visibility_change);
            if (reconnect_timeout_ref.current) {
                clearTimeout(reconnect_timeout_ref.current);
                reconnect_timeout_ref.current = null;
            }
            clearInterval(check_connection_interval);
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1000, '컴포넌트 언마운트');
            }
            if (ws_ref.current === ws) {
                ws_ref.current = null;
            }
            is_reconnecting_ref.current = false;
        };
    }, [nickname]);

    useEffect(() => {
        const container = messages_container_ref.current;
        if (!container || messages.length === 0) return;

        const last_message = messages[messages.length - 1];
        const is_my_message = last_message && (
            (last_message.type === 'message' && last_message.nickname === nickname) ||
            (last_message.type === 'whisper' && last_message.nickname === nickname)
        );

        const check_and_scroll = () => {
            if (!container) return;
            
            if (is_my_message) {
                messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
                was_at_bottom_ref.current = true;
            } else {
                const scroll_height = container.scrollHeight;
                const scroll_top = container.scrollTop;
                const client_height = container.clientHeight;
                const distance_from_bottom = scroll_height - scroll_top - client_height;
                
                if (was_at_bottom_ref.current || distance_from_bottom < 300) {
                    messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
                    was_at_bottom_ref.current = true;
                }
            }
        };

        setTimeout(() => {
            requestAnimationFrame(() => {
                check_and_scroll();
            });
        }, 100);

        const check_scroll_position = () => {
            if (!container) return;
            const scroll_top = container.scrollTop;
            const scroll_height = container.scrollHeight;
            const client_height = container.clientHeight;
            const distance_from_bottom = scroll_height - scroll_top - client_height;
            const is_near_bottom = distance_from_bottom < 100;
            setShowScrollButton(!is_near_bottom && messages.length > 0);
            was_at_bottom_ref.current = is_near_bottom;
            
            if (is_near_bottom && !document.hidden && title_blink_interval_ref.current) {
                clearInterval(title_blink_interval_ref.current);
                title_blink_interval_ref.current = null;
                document.title = 'chat programme';
            }
        };

        const setup_scroll_listener = () => {
            if (container) {
                check_scroll_position();
                container.addEventListener('scroll', check_scroll_position);
            }
        };

        requestAnimationFrame(() => {
            setTimeout(setup_scroll_listener, 50);
        });

        return () => {
            if (container) {
                container.removeEventListener('scroll', check_scroll_position);
            }
        };
    }, [messages, nickname]);

    useEffect(() => {
        const last_message = messages[messages.length - 1];
        if (last_message && last_message.type === 'message' && last_message.nickname !== nickname) {
            if (title_blink_interval_ref.current) {
                clearInterval(title_blink_interval_ref.current);
                title_blink_interval_ref.current = null;
            }
            
            const original_title = 'chat programme';
            let blink_count = 0;
            const max_blinks = 20;
            
            const container = messages_container_ref.current;
            const is_at_bottom = container ? (() => {
                const scroll_height = container.scrollHeight;
                const scroll_top = container.scrollTop;
                const client_height = container.clientHeight;
                const distance_from_bottom = scroll_height - scroll_top - client_height;
                return distance_from_bottom < 100;
            })() : false;
            
            // 브라우저 알림 권한 요청 및 알림 표시
            const show_browser_notification = async () => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    const message_preview = last_message.message 
                        ? (last_message.message.length > 50 ? last_message.message.substring(0, 50) + '...' : last_message.message)
                        : (last_message.image_data ? '이미지' : last_message.emoji || '메시지');
                    
                    new Notification('새 메시지', {
                        body: `${last_message.nickname}: ${message_preview}`,
                        icon: '/icon.svg',
                        tag: 'chat-message',
                        requireInteraction: false
                    });
                } else if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().then((permission) => {
                        if (permission === 'granted' && last_message) {
                            const message_preview = last_message.message 
                                ? (last_message.message.length > 50 ? last_message.message.substring(0, 50) + '...' : last_message.message)
                                : (last_message.image_data ? '이미지' : last_message.emoji || '메시지');
                            
                            new Notification('새 메시지', {
                                body: `${last_message.nickname}: ${message_preview}`,
                                icon: '/icon.svg',
                                tag: 'chat-message',
                                requireInteraction: false
                            });
                        }
                    });
                }
            };
            
            // 창이 아래로 내려가 있거나 숨겨져 있을 때만 알림
            if (document.hidden || !is_at_bottom) {
                show_browser_notification();
            }
            
            // 타이틀 깜빡임: 창이 아래로 내려가 있거나 숨겨져 있을 때
            if (document.hidden || !is_at_bottom) {
                const blink_interval = setInterval(() => {
                    if (!document.hidden) {
                        const current_container = messages_container_ref.current;
                        if (current_container) {
                            const scroll_height = current_container.scrollHeight;
                            const scroll_top = current_container.scrollTop;
                            const client_height = current_container.clientHeight;
                            const distance_from_bottom = scroll_height - scroll_top - client_height;
                            const is_currently_at_bottom = distance_from_bottom < 100;
                            
                            if (is_currently_at_bottom) {
                                clearInterval(blink_interval);
                                title_blink_interval_ref.current = null;
                                document.title = original_title;
                                return;
                            }
                        }
                    }
                    
                    if (blink_count >= max_blinks) {
                        clearInterval(blink_interval);
                        title_blink_interval_ref.current = null;
                        document.title = original_title;
                        return;
                    }
                    
                    // 창이 아래로 내려가 있거나 숨겨져 있을 때 깜빡임
                    document.title = blink_count % 2 === 0 ? '● New message - chat programme' : original_title;
                    blink_count++;
                }, 500);
                
                title_blink_interval_ref.current = blink_interval;
                
                return () => {
                    if (title_blink_interval_ref.current === blink_interval) {
                        clearInterval(blink_interval);
                        title_blink_interval_ref.current = null;
                    }
                    document.title = original_title;
                };
            }
        }
    }, [messages, nickname]);

    useEffect(() => {
        const cleanup_old_messages = () => {
            setMessages((prev) => {
                const now = Date.now();
                const five_minutes = 5 * 60 * 1000;
                
                const updated = prev.filter((msg) => {
                    if (msg.type === 'message' || msg.type === 'whisper') {
                        const message_age = now - msg.timestamp;
                        if (message_age >= five_minutes) {
                            if (msg.image_data) {
                                msg.image_data = undefined;
                            }
                            return false;
                        }
                    }
                    return true;
                });
                messages_ref.current = updated;
                return updated;
            });
        };

        const interval = setInterval(cleanup_old_messages, 10000);

        return () => clearInterval(interval);
    }, []);

    const handleSendMessage = (message: string, target_nickname?: string, image_data?: string, emoji?: string) => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN && isJoined) {
            try {
                if (target_nickname) {
                    ws_ref.current.send(JSON.stringify({
                        type: 'whisper',
                        message: message,
                        target_nickname: target_nickname,
                        image_data: image_data,
                        emoji: emoji
                    }));
                    console.log('귓속말 전송:', message, '->', target_nickname, image_data ? '(이미지 포함)' : '', emoji ? '(이모티콘 포함)' : '');
                } else {
                    ws_ref.current.send(JSON.stringify({
                        type: 'message',
                        message: message,
                        image_data: image_data,
                        emoji: emoji
                    }));
                    console.log('메시지 전송:', message, image_data ? '(이미지 포함)' : '', emoji ? '(이모티콘 포함)' : '');
                }
            } catch (error) {
                console.error('메시지 전송 실패:', error);
                setConnectionError('메시지 전송에 실패했습니다.');
            }
        } else {
            if (!isJoined) {
                setConnectionError('입장 중입니다. 잠시 후 다시 시도해주세요.');
            } else {
                console.error('웹소켓이 연결되지 않았습니다. 상태:', ws_ref.current?.readyState);
                setConnectionError('웹소켓이 연결되지 않았습니다.');
            }
        }
    };

    const handleDisconnect = () => {
        if (ws_ref.current) {
            ws_ref.current.close();
        }
        onDisconnect();
    };

    const scrollToBottom = () => {
        messages_end_ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden">
            <div className="relative bg-slate-950 border-b border-slate-800 px-2 py-2 md:px-4 md:py-3">
                <div className="flex items-center justify-between max-w-4xl mx-auto flex-wrap gap-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <h1 className="text-sm text-slate-300 font-bold" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                            Let us Chat!
                        </h1>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-slate-500 font-bold" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                            {isConnected ? '[ONLINE]' : connectionError ? '[ERROR]' : '[CONNECTING...]'}
                        </span>
                        <UserListChip user_count={user_list.length} user_list={user_list} />
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <span className="text-sm text-slate-400 hidden sm:inline" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                            &gt; {nickname}
                        </span>
                        <button
                            onClick={handleDisconnect}
                            className="px-2 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-slate-900 rounded border border-slate-700 transition-colors md:px-3"
                            style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                        >
                            [EXIT]
                        </button>
                    </div>
                </div>
            </div>

            {connectionError && (
                <div className="relative bg-red-950/30 border-l-4 border-red-600 text-red-400 p-4 mx-4 mt-4 rounded">
                    <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>[ERROR]</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>{connectionError}</p>
                    <p className="text-sm mt-2 text-red-500/80" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>웹소켓 서버 실행: <code className="bg-slate-900 px-1 rounded">npm run ws</code></p>
                </div>
            )}
            <div ref={messages_container_ref} className="flex-1 overflow-y-auto px-4 py-3 relative">
                {show_scroll_button && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed bottom-24 right-[calc(1rem+10px)] md:right-[calc(2rem+10px)] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full p-2 shadow-lg border border-slate-700 transition-all hover:scale-110 z-40"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                        title="밑으로"
                    >
                        <div className="flex flex-col items-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            <span className="text-sm mt-0.5">밑으로</span>
                        </div>
                    </button>
                )}
                <div className="max-w-4xl mx-auto">
                    {messages.map((msg, index) => {
                        const unique_key = `${msg.type}-${msg.timestamp}-${msg.nickname}-${index}`;
                        if (msg.type === 'message' && (msg.message || msg.image_data || msg.emoji)) {
                            return (
                                <ChatMessage
                                    key={unique_key}
                                    nickname={msg.nickname}
                                    message={msg.message || ''}
                                    timestamp={msg.timestamp}
                                    isOwn={msg.nickname === nickname}
                                    image_data={msg.image_data}
                                    emoji={msg.emoji}
                                    message_id={msg.message_id}
                                    read_count={msg.read_count}
                                    total_users={user_list.length}
                                />
                            );
                        } else if (msg.type === 'whisper' && (msg.message || msg.image_data || msg.emoji) && msg.target_nickname) {
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
                                        emoji={msg.emoji}
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
                disabled={!isConnected || !isJoined}
                user_list={user_list}
                current_nickname={nickname}
            />
            <div className="fixed bottom-2 right-2 text-sm text-slate-600" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                v0.1.1
            </div>
        </div>
    );
}

