'use client';

import { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SystemMessage from './SystemMessage';
import UserListChip from './UserListChip';
import { APP_VERSION } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

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

interface Message {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper' | 'read_update' | 'reaction_update' | 'delete_time_update' | 'nickname_change' | 'nickname_changed' | 'ai_message';
    nickname: string;
    message?: string;
    timestamp: number;
    reason?: string;
    user_list?: string[];
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
    reply_to?: string;
    reply_to_preview?: ReplyPreview;
    delete_time?: number;
    old_nickname?: string;
    new_nickname?: string;
    is_ai?: boolean;
}

interface ChatRoomProps {
    nickname: string;
    server_url: string;
    onDisconnect: (errorMessage?: string) => void;
}

export default function ChatRoom({ nickname: initial_nickname, server_url, onDisconnect }: ChatRoomProps) {
    const { theme_colors } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [user_list, setUserList] = useState<string[]>([]);
    const [show_scroll_button, setShowScrollButton] = useState(false);
    const [is_drag_over, setIsDragOver] = useState(false);
    const [drag_counter, setDragCounter] = useState(0);
    const [hidden_messages, setHiddenMessages] = useState<Set<string>>(new Set());
    const [delete_time, setDeleteTime] = useState(5);
    const [show_settings_menu, setShowSettingsMenu] = useState(false);
    const [reply_to_message, setReplyToMessage] = useState<Message | null>(null);
    const [is_editing_nickname, setIsEditingNickname] = useState(false);
    const [current_nickname, setCurrentNickname] = useState(initial_nickname);
    const [new_nickname, setNewNickname] = useState(initial_nickname);
    const [toast_message, setToastMessage] = useState<string | null>(null);
    const [highlighted_message_id, setHighlightedMessageId] = useState<string | null>(null);
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
    const settings_menu_ref = useRef<HTMLDivElement>(null);
    const toast_timeout_ref = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, duration: number = 3000) => {
        if (toast_timeout_ref.current) {
            clearTimeout(toast_timeout_ref.current);
        }
        setToastMessage(message);
        toast_timeout_ref.current = setTimeout(() => {
            setToastMessage(null);
        }, duration);
    };
    
    useEffect(() => {
        onDisconnect_ref.current = onDisconnect;
    }, [onDisconnect]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settings_menu_ref.current && !settings_menu_ref.current.contains(event.target as Node)) {
                setShowSettingsMenu(false);
                setIsEditingNickname(false);
            }
        };

        if (show_settings_menu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show_settings_menu]);

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
                const server_url_obj = new URL(server_url);
                const protocol = server_url_obj.protocol === 'https:' ? 'wss:' : 'ws:';
                const hostname = server_url_obj.hostname;
                const ws_port = '9999';
                const ws_url = `${protocol}//${hostname}:${ws_port}`;
                ws = new WebSocket(ws_url);
                ws_ref.current = ws;

                ws.onopen = () => {
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
                            nickname: current_nickname
                        }));
                    }
                };

                ws.onmessage = (event) => {
                    try {
                        const message: Message = JSON.parse(event.data);
                        
                        if (message.type === 'join_rejected') {
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
                                if (message.delete_time) {
                                    setDeleteTime(message.delete_time);
                                }
                            }
                            return;
                        }
                        if (message.type === 'join' && message.nickname === current_nickname) {
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
                        if (message.type === 'reaction_update' && message.message_id) {
                            if (is_mounted) {
                                setMessages((prev) => {
                                    const updated = prev.map((msg) => {
                                        if (msg.message_id === message.message_id) {
                                            return { ...msg, reactions: message.reactions };
                                        }
                                        return msg;
                                    });
                                    messages_ref.current = updated;
                                    return updated;
                                });
                            }
                            return;
                        }
                        if (message.type === 'delete_time_update' && message.delete_time) {
                            if (is_mounted) {
                                setDeleteTime(message.delete_time);
                            }
                            return;
                        }
                        if (message.type === 'nickname_change' && message.reason) {
                            if (is_mounted) {
                                showToast(message.reason);
                            }
                            return;
                        }
                        if (message.type === 'nickname_changed' && message.old_nickname && message.new_nickname) {
                            if (is_mounted) {
                                if (message.old_nickname === current_nickname) {
                                    setCurrentNickname(message.new_nickname);
                                    setNewNickname(message.new_nickname);
                                }
                                setMessages((prev) => {
                                    const system_message: Message = {
                                        type: 'join',
                                        nickname: '',
                                        message: `${message.old_nickname}님이 ${message.new_nickname}(으)로 이름을 변경했습니다.`,
                                        timestamp: message.timestamp,
                                        message_id: `nickname-change-${message.timestamp}`
                                    };
                                    const updated = [...prev, system_message];
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
                                was_at_bottom_ref.current = distance_from_bottom <= 200;
                            }
                            
                            const new_message = {
                                ...message,
                                message_id: message.message_id || `${message.type}-${message.timestamp}-${message.nickname}-${Date.now()}`
                            };
                            
                            setMessages((prev) => {
                                const updated = [...prev, new_message];
                                messages_ref.current = updated;
                                
                                if (is_visible_ref.current && new_message.nickname !== current_nickname && new_message.message_id) {
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
                    } catch {
                        // ignore parse error
                    }
                };

                ws.onerror = () => {
                    if (is_mounted) {
                        setIsConnected(false);
                        setConnectionError('웹소켓 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.');
                    }
                };

                ws.onclose = (event) => {
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
            } catch {
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
                    if (msg.message_id && !read_messages_ref.current.has(msg.message_id) && msg.nickname !== current_nickname) {
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

        const handle_extension_message = (e: MessageEvent) => {
            if (e.data?.type === 'visibilityChange') {
                is_visible_ref.current = e.data.visible;
                if (e.data.visible) {
                    handle_visibility_change();
                }
            }
        };
        window.addEventListener('message', handle_extension_message);

        return () => {
            is_mounted = false;
            document.removeEventListener('visibilitychange', handle_visibility_change);
            window.removeEventListener('message', handle_extension_message);
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
    }, [current_nickname]);

    useEffect(() => {
        const container = messages_container_ref.current;
        if (!container || messages.length === 0) return;

        const smooth_scroll_to_bottom = (target_scroll: number) => {
            if (!container) return;
            
            const start_scroll = container.scrollTop;
            const distance = target_scroll - start_scroll;
            const duration = Math.min(300, Math.abs(distance) * 0.5);
            const start_time = performance.now();

            const animate = (current_time: number) => {
                const elapsed = current_time - start_time;
                const progress = Math.min(elapsed / duration, 1);
                const ease_out_cubic = 1 - Math.pow(1 - progress, 3);
                const current_scroll = start_scroll + distance * ease_out_cubic;
                
                container.scrollTop = current_scroll;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        };

        const check_and_scroll = () => {
            if (!container) return;
            
            // 실제 현재 스크롤 위치를 확인
            const scroll_height = container.scrollHeight;
            const scroll_top = container.scrollTop;
            const client_height = container.clientHeight;
            const distance_from_bottom = scroll_height - scroll_top - client_height;
            
            // 162번 라인과 동일한 조건 (distance_from_bottom <= 200)일 때만 스크롤
            if (distance_from_bottom <= 200) {
                const target_scroll = scroll_height - client_height;
                smooth_scroll_to_bottom(target_scroll);
            }
        };

        const check_scroll_position = () => {
            if (!container) return;
            const scroll_top = container.scrollTop;
            const scroll_height = container.scrollHeight;
            const client_height = container.clientHeight;
            const distance_from_bottom = scroll_height - scroll_top - client_height;
            const is_near_bottom = distance_from_bottom < 100;
            // 162번 라인과 동일한 조건으로 was_at_bottom_ref 업데이트
            was_at_bottom_ref.current = distance_from_bottom <= 200;
            setShowScrollButton(!is_near_bottom && messages.length > 0);
            
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

        // 바닥에 있을 때 새 메시지가 오면 스크롤
        const timeout_id = setTimeout(() => {
            requestAnimationFrame(() => {
                check_and_scroll();
            });
        }, 50);

        requestAnimationFrame(() => {
            setTimeout(setup_scroll_listener, 50);
        });

        return () => {
            if (container) {
                container.removeEventListener('scroll', check_scroll_position);
            }
            clearTimeout(timeout_id);
        };
    }, [messages, current_nickname]);

    useEffect(() => {
        const last_message = messages[messages.length - 1];
        if (last_message && last_message.type === 'message' && last_message.nickname !== current_nickname) {
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
                        : (last_message.image_data ? '이미지' : last_message.file_data ? '파일' : last_message.emoji || '메시지');
                    
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
                                : (last_message.image_data ? '이미지' : last_message.file_data ? '파일' : last_message.emoji || '메시지');
                            
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
    }, [messages, current_nickname]);

    useEffect(() => {
        const cleanup_old_messages = () => {
            setMessages((prev) => {
                const now = Date.now();
                const delete_time_ms = delete_time * 60 * 1000;
                
                const updated = prev.filter((msg) => {
                    if (msg.type === 'message' || msg.type === 'whisper') {
                        const message_age = now - msg.timestamp;
                        if (message_age >= delete_time_ms) {
                            if (msg.image_data) {
                                msg.image_data = undefined;
                            }
                            if (msg.file_data) {
                                msg.file_data = undefined;
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
    }, [delete_time]);

    const handleSendMessage = (message: string, target_nickname?: string, image_data?: string, emoji?: string, file_data?: string, file_name?: string, file_size?: number, file_type?: string) => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN && isJoined) {
            try {
                const reply_to_data = reply_to_message ? {
                    reply_to: reply_to_message.message_id,
                    reply_to_preview: {
                        nickname: reply_to_message.nickname,
                        message: reply_to_message.message || '',
                        image_data: !!reply_to_message.image_data,
                        file_name: reply_to_message.file_name,
                        message_id: reply_to_message.message_id
                    }
                } : {};

                const message_data = target_nickname ? {
                    type: 'whisper',
                    message: message,
                    target_nickname: target_nickname,
                    image_data: image_data,
                    emoji: emoji,
                    file_data: file_data,
                    file_name: file_name,
                    file_size: file_size,
                    file_type: file_type,
                    ...reply_to_data
                } : {
                    type: 'message',
                    message: message,
                    image_data: image_data,
                    emoji: emoji,
                    file_data: file_data,
                    file_name: file_name,
                    file_size: file_size,
                    file_type: file_type,
                    ...reply_to_data
                };

                setReplyToMessage(null);

                const message_string = JSON.stringify(message_data);
                const message_size = new Blob([message_string]).size;
                
                if (message_size > 16 * 1024 * 1024) {
                    showToast('파일이 너무 큽니다. 더 작은 파일을 선택해주세요.');
                    return;
                }

                ws_ref.current.send(message_string);
            } catch {
                showToast('메시지 전송에 실패했습니다.');
                setConnectionError('메시지 전송에 실패했습니다.');
            }
        } else {
            if (!isJoined) {
                setConnectionError('입장 중입니다. 잠시 후 다시 시도해주세요.');
            } else {
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

    const handleReaction = (message_id: string, emoji: string) => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            ws_ref.current.send(JSON.stringify({
                type: 'reaction',
                message_id: message_id,
                reaction_emoji: emoji
            }));
        }
    };

    const handleDeleteMessage = (message_id: string) => {
        setHiddenMessages((prev) => new Set(prev).add(message_id));
    };

    const handleClearAllMessages = () => {
        const all_ids = messages
            .filter((msg) => msg.message_id)
            .map((msg) => msg.message_id as string);
        setHiddenMessages(new Set(all_ids));
    };

    const handleReply = (message_id: string) => {
        const target_message = messages.find((msg) => msg.message_id === message_id);
        if (target_message) {
            setReplyToMessage(target_message);
        }
    };

    const handleScrollToMessage = (message_id: string) => {
        const element = document.getElementById(`message-${message_id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(message_id);
            setTimeout(() => setHighlightedMessageId(null), 2000);
        }
    };

    const handleDeleteTimeChange = (new_time: number) => {
        if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            ws_ref.current.send(JSON.stringify({
                type: 'delete_time_update',
                delete_time: new_time
            }));
        }
    };

    const handleNicknameChange = () => {
        const trimmed = new_nickname.trim();
        if (trimmed && trimmed !== current_nickname && ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN) {
            ws_ref.current.send(JSON.stringify({
                type: 'nickname_change',
                new_nickname: trimmed
            }));
        }
        setIsEditingNickname(false);
    };

    const scrollToBottom = () => {
        const container = messages_container_ref.current;
        if (!container) return;
        
        const scroll_height = container.scrollHeight;
        const client_height = container.clientHeight;
        const target_scroll = scroll_height - client_height;
        
        const start_scroll = container.scrollTop;
        const distance = target_scroll - start_scroll;
        const duration = Math.min(400, Math.abs(distance) * 0.6);
        const start_time = performance.now();

        const animate = (current_time: number) => {
            const elapsed = current_time - start_time;
            const progress = Math.min(elapsed / duration, 1);
            const ease_out_cubic = 1 - Math.pow(1 - progress, 3);
            const current_scroll = start_scroll + distance * ease_out_cubic;
            
            container.scrollTop = current_scroll;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    };

    const processFile = async (file: File) => {
        if (!isConnected || !isJoined) {
            showToast('연결되지 않았습니다.');
            return;
        }

        const max_size = file.type.startsWith('image/') ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > max_size) {
            showToast(file.type.startsWith('image/') ? '이미지 크기는 5MB 이하여야 합니다.' : '파일 크기는 10MB 이하여야 합니다.');
            return;
        }

        try {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const result = e.target?.result as string;
                if (file.type.startsWith('image/')) {
                    handleSendMessage('', undefined, result);
                } else {
                    handleSendMessage('', undefined, undefined, undefined, result, file.name, file.size, file.type);
                }
            };

            reader.onerror = () => {
                showToast('파일을 읽는데 실패했습니다.');
            };

            reader.readAsDataURL(file);
        } catch {
            showToast('파일 처리에 실패했습니다.');
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => prev + 1);
        if (e.dataTransfer.types.includes('Files')) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCounter(prev => {
            const new_count = prev - 1;
            if (new_count === 0) {
                setIsDragOver(false);
            }
            return new_count;
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.types.includes('Files')) {
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        setDragCounter(0);

        if (!isConnected || !isJoined) {
            showToast('연결되지 않았습니다.');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div 
            className="flex flex-col h-screen relative overflow-hidden neumorphic" 
            style={{ backgroundColor: theme_colors.chat_background }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Toast */}
            {toast_message && (
                <div 
                    className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[200] px-4 py-2 rounded-xl shadow-lg animate-fade-in"
                    style={{ 
                        backgroundColor: theme_colors.button_input_background, 
                        border: `1px solid ${theme_colors.info_text}`,
                        color: theme_colors.input_text
                    }}
                >
                    <span className="text-sm">{toast_message}</span>
                </div>
            )}
            <div className="relative border-b px-2 py-1.5 sm:px-3 sm:py-2 neumorphic" style={{ backgroundColor: theme_colors.input_bar_background, borderColor: theme_colors.info_text }}>
                <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <UserListChip user_count={user_list.length} user_list={user_list} />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative" ref={settings_menu_ref}>
                            <button
                                onClick={() => setShowSettingsMenu(!show_settings_menu)}
                                className="p-1.5 rounded-full transition-all hover:opacity-80"
                                style={{ 
                                    color: theme_colors.info_text,
                                    backgroundColor: theme_colors.button_input_background
                                }}
                                title="설정"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                            {show_settings_menu && (
                                <div 
                                    className="absolute top-full right-0 mt-1 rounded-xl p-2 z-50 min-w-[160px] shadow-lg"
                                    style={{ backgroundColor: theme_colors.button_input_background, border: `1px solid ${theme_colors.info_text}` }}
                                >
                                    {/* 닉네임 */}
                                    <div className="px-3 py-2">
                                        {is_editing_nickname ? (
                                            <input
                                                type="text"
                                                value={new_nickname}
                                                onChange={(e) => setNewNickname(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleNicknameChange();
                                                    if (e.key === 'Escape') setIsEditingNickname(false);
                                                }}
                                                onBlur={handleNicknameChange}
                                                autoFocus
                                                className="w-full px-2 py-1 rounded text-xs bg-transparent border"
                                                style={{ 
                                                    color: theme_colors.input_text,
                                                    borderColor: theme_colors.info_text
                                                }}
                                                maxLength={20}
                                            />
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setNewNickname(current_nickname);
                                                    setIsEditingNickname(true);
                                                }}
                                                className="flex items-center gap-2 text-xs w-full"
                                                style={{ color: theme_colors.input_text }}
                                            >
                                                <span>✏️</span>
                                                <span className="truncate">{current_nickname}</span>
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="h-px my-1" style={{ backgroundColor: theme_colors.info_text, opacity: 0.3 }} />
                                    
                                    {/* 삭제 시간 */}
                                    <div className="px-3 py-2">
                                        <div className="text-xs mb-2" style={{ color: theme_colors.info_text }}>
                                            메시지 삭제 시간 (분)
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {[1, 3, 5, 10, 30, 60].map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => handleDeleteTimeChange(time)}
                                                    className="px-2 py-1 rounded text-xs transition-colors"
                                                    style={{ 
                                                        backgroundColor: delete_time === time ? theme_colors.chat_background : 'transparent',
                                                        color: delete_time === time ? theme_colors.input_text : theme_colors.info_text,
                                                        fontWeight: delete_time === time ? 600 : 400
                                                    }}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="h-px my-1" style={{ backgroundColor: theme_colors.info_text, opacity: 0.3 }} />
                                    
                                    {/* 전체 삭제 */}
                                    <button
                                        onClick={() => {
                                            handleClearAllMessages();
                                            setShowSettingsMenu(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                                        style={{ color: theme_colors.input_text }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme_colors.chat_background}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <span>메시지 전체 삭제</span>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="p-1.5 rounded-full transition-all hover:opacity-80"
                            style={{ 
                                color: theme_colors.info_text,
                                backgroundColor: theme_colors.button_input_background
                            }}
                            title="나가기"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {connectionError && (
                <div className="relative bg-red-950/30 border-l-4 border-red-600 text-red-400 p-4 mx-4 mt-4 rounded">
                    <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>[ERROR]</p>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-sans)', fontWeight: 400 }}>{connectionError}</p>
                    <p className="text-sm mt-2 text-red-500/80" style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}>웹소켓 서버 실행: <code className="px-1 rounded" style={{ backgroundColor: theme_colors.button_input_background }}>npm run ws</code></p>
                </div>
            )}
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                    backgroundColor: is_drag_over ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
                    backdropFilter: is_drag_over ? 'blur(4px)' : 'blur(0px)',
                    opacity: is_drag_over ? 1 : 0,
                    pointerEvents: is_drag_over ? 'auto' : 'none',
                    visibility: is_drag_over ? 'visible' : 'hidden'
                }}
            >
                <div 
                    className="neumorphic rounded-3xl p-8 md:p-12 flex flex-col items-center gap-4 transform transition-all duration-300"
                    style={{
                        backgroundColor: theme_colors.button_input_background,
                        border: `2px dashed ${theme_colors.info_text}`,
                        transform: is_drag_over ? 'scale(1)' : 'scale(0.9)',
                        animation: is_drag_over ? 'pulse-scale 1.5s ease-in-out infinite' : 'none'
                    }}
                >
                    <svg 
                        width="64" 
                        height="64" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="transition-transform duration-300"
                        style={{ 
                            color: theme_colors.input_text,
                            transform: is_drag_over ? 'translateY(0)' : 'translateY(-10px)'
                        }}
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p 
                        className="text-xl md:text-2xl font-bold transition-opacity duration-300"
                        style={{ 
                            color: theme_colors.input_text, 
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 600,
                            opacity: is_drag_over ? 1 : 0
                        }}
                    >
                        파일을 드랍해주세요
                    </p>
                    <p 
                        className="text-sm md:text-base transition-opacity duration-300"
                        style={{ 
                            color: theme_colors.info_text, 
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 400,
                            opacity: is_drag_over ? 0.7 : 0
                        }}
                    >
                        이미지 또는 파일을 여기에 놓으세요
                    </p>
                </div>
            </div>
            <div ref={messages_container_ref} className="flex-1 overflow-y-auto px-4 py-3 pb-24 relative">
                {show_scroll_button && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed bottom-24 right-[calc(1rem+10px)] md:right-[calc(2rem+10px)] rounded-full p-2 shadow-lg border transition-all hover:scale-110 z-40"
                        style={{ 
                            backgroundColor: theme_colors.button_input_background,
                            color: theme_colors.input_text,
                            borderColor: theme_colors.info_text,
                            fontFamily: 'var(--font-sans)', 
                            fontWeight: 500 
                        }}
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
                    {(() => {
                        const filtered_messages = messages.filter((msg) => !msg.message_id || !hidden_messages.has(msg.message_id));
                        return filtered_messages.map((msg, index) => {
                            const unique_key = msg.message_id || `${msg.type}-${msg.timestamp}-${msg.nickname}`;
                            const prev_msg = index > 0 ? filtered_messages[index - 1] : null;
                            const is_same_user = prev_msg && 
                                prev_msg.nickname === msg.nickname && 
                                (prev_msg.type === 'message' || prev_msg.type === 'whisper') &&
                                (msg.type === 'message' || msg.type === 'whisper') &&
                                (msg.timestamp - prev_msg.timestamp < 60000);
                            const show_nickname = !is_same_user;

                            if (msg.type === 'message' && (msg.message || msg.image_data || msg.emoji || msg.file_data)) {
                                return (
                                    <ChatMessage
                                        key={unique_key}
                                        nickname={msg.nickname}
                                        message={msg.message || ''}
                                        timestamp={msg.timestamp}
                                        isOwn={msg.nickname === current_nickname}
                                        image_data={msg.image_data}
                                        emoji={msg.emoji}
                                        file_data={msg.file_data}
                                        file_name={msg.file_name}
                                        file_size={msg.file_size}
                                        file_type={msg.file_type}
                                        message_id={msg.message_id}
                                        read_count={msg.read_count}
                                        total_users={user_list.length}
                                        reactions={msg.reactions}
                                        reply_to_preview={msg.reply_to_preview}
                                        is_highlighted={highlighted_message_id === msg.message_id}
                                        show_nickname={show_nickname}
                                        onReaction={handleReaction}
                                        onDelete={handleDeleteMessage}
                                        onReply={handleReply}
                                        onScrollToMessage={handleScrollToMessage}
                                    />
                                );
                            } else if (msg.type === 'whisper' && (msg.message || msg.image_data || msg.emoji || msg.file_data) && msg.target_nickname) {
                                const is_sender = msg.nickname === current_nickname;
                                const is_receiver = msg.target_nickname.toLowerCase() === current_nickname.toLowerCase();
                                
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
                                            image_data={msg.image_data}
                                            emoji={msg.emoji}
                                            file_data={msg.file_data}
                                            file_name={msg.file_name}
                                            file_size={msg.file_size}
                                            file_type={msg.file_type}
                                            message_id={msg.message_id}
                                            reactions={msg.reactions}
                                            is_highlighted={highlighted_message_id === msg.message_id}
                                            show_nickname={show_nickname}
                                            onReaction={handleReaction}
                                            onDelete={handleDeleteMessage}
                                            onScrollToMessage={handleScrollToMessage}
                                        />
                                    );
                                }
                                return null;
                            } else if (msg.type === 'join') {
                            return (
                                <SystemMessage
                                    key={unique_key}
                                    message={msg.message || `${msg.nickname}님이 입장했습니다.`}
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
                        });
                    })()}
                    <div ref={messages_end_ref} />
                </div>
            </div>

            <ChatInput 
                onSendMessage={handleSendMessage} 
                onSendAIMessage={(ai_response) => {
                    if (ws_ref.current && ws_ref.current.readyState === WebSocket.OPEN && isJoined) {
                        ws_ref.current.send(JSON.stringify({
                            type: 'ai_message',
                            message: ai_response
                        }));
                    }
                }}
                disabled={!isConnected || !isJoined}
                user_list={user_list}
                current_nickname={current_nickname}
                reply_to_message={reply_to_message}
                onCancelReply={() => setReplyToMessage(null)}
                messages_for_ai={messages
                    .filter(msg => (msg.type === 'message' || msg.type === 'whisper') && msg.message)
                    .slice(-50)
                    .map(msg => ({
                        nickname: msg.nickname,
                        message: msg.message,
                        timestamp: msg.timestamp
                    }))}
            />
            <div className="fixed bottom-2 right-2 text-sm z-40" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                v{APP_VERSION}
            </div>
        </div>
    );
}

