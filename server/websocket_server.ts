import { WebSocketServer, WebSocket } from 'ws';

interface ChatMessage {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper' | 'read' | 'read_update';
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
}

const wss = new WebSocketServer({ 
    host: '0.0.0.0',
    port: 9999,
    perMessageDeflate: false,
    clientTracking: true
});

const clients = new Map<WebSocket, string>();
const message_readers = new Map<string, Set<string>>();

function isMonitor(nickname: string): boolean {
    return nickname.startsWith('__monitor__');
}

function getRealUserCount(): number {
    let count = 0;
    clients.forEach((nickname) => {
        if (!isMonitor(nickname)) count++;
    });
    return count;
}

wss.on('listening', () => {
    console.log('웹소켓 서버가 포트 9999에서 실행 중입니다.');
});

wss.on('connection', (ws: WebSocket) => {
    console.log('새 클라이언트 연결');

    ws.on('message', (data: Buffer) => {
        try {
            const parsed_data = JSON.parse(data.toString());
            
            if (parsed_data.type === 'join') {
                if (clients.has(ws)) {
                    return;
                }
                
                const nickname = parsed_data.nickname || '익명';
                const trimmed_nickname = nickname.trim();
                
                if (!trimmed_nickname) {
                    const reject_message: ChatMessage = {
                        type: 'join_rejected',
                        nickname: '',
                        timestamp: Date.now(),
                        reason: '닉네임을 입력해주세요.'
                    };
                    ws.send(JSON.stringify(reject_message));
                    ws.close(1008, '닉네임이 비어있습니다.');
                    return;
                }
                
                const is_duplicate = Array.from(clients.entries()).some(
                    ([existing_ws, existing_nickname]) => 
                        existing_ws !== ws && existing_nickname.toLowerCase() === trimmed_nickname.toLowerCase()
                );
                
                if (is_duplicate) {
                    const reject_message: ChatMessage = {
                        type: 'join_rejected',
                        nickname: trimmed_nickname,
                        timestamp: Date.now(),
                        reason: '이미 사용 중인 닉네임입니다.'
                    };
                    ws.send(JSON.stringify(reject_message));
                    ws.close(1008, '닉네임 중복');
                    console.log(`${trimmed_nickname} 닉네임 중복으로 입장 거부`);
                    return;
                }
                
                clients.set(ws, trimmed_nickname);
                
                if (isMonitor(trimmed_nickname)) {
                    console.log(`[Monitor] ${trimmed_nickname} connected`);
                } else {
                    const join_message: ChatMessage = {
                        type: 'join',
                        nickname: trimmed_nickname,
                        timestamp: Date.now()
                    };
                    
                    broadcast(join_message, ws);
                    broadcastUserList();
                    console.log(`${trimmed_nickname}님이 입장했습니다.`);
                }
            } else if (parsed_data.type === 'message') {
                if (!clients.has(ws)) {
                    const reject_message: ChatMessage = {
                        type: 'join_rejected',
                        nickname: '',
                        timestamp: Date.now(),
                        reason: '먼저 입장해주세요.'
                    };
                    ws.send(JSON.stringify(reject_message));
                    return;
                }
                
                const nickname = clients.get(ws);
                if (!nickname) return;
                
                const message_id = `${Date.now()}-${nickname}-${Math.random().toString(36).substring(7)}`;
                const total_users = getRealUserCount();
                const unread_count = total_users > 1 ? total_users - 1 : 0;
                
                const chat_message: ChatMessage = {
                    type: 'message',
                    nickname: nickname,
                    message: parsed_data.message,
                    image_data: parsed_data.image_data,
                    emoji: parsed_data.emoji,
                    file_data: parsed_data.file_data,
                    file_name: parsed_data.file_name,
                    file_size: parsed_data.file_size,
                    file_type: parsed_data.file_type,
                    timestamp: Date.now(),
                    message_id: message_id,
                    read_count: unread_count,
                    total_users: total_users
                };
                
                if (parsed_data.file_data) {
                    const file_data_size = parsed_data.file_data.length;
                    console.log(`[서버] 파일 메시지 수신: ${parsed_data.file_name} (${parsed_data.file_size} bytes, base64: ${file_data_size} bytes)`);
                }
                
                message_readers.set(message_id, new Set());
                broadcast(chat_message);
            } else if (parsed_data.type === 'read' && parsed_data.message_id) {
                if (!clients.has(ws)) return;
                const reader_nickname = clients.get(ws);
                if (!reader_nickname || isMonitor(reader_nickname)) return;
                
                const message_id = parsed_data.message_id;
                const readers = message_readers.get(message_id);
                
                if (readers && !readers.has(reader_nickname)) {
                    readers.add(reader_nickname);
                    const total_users = getRealUserCount();
                    const unread_count = total_users > 1 ? Math.max(0, total_users - 1 - readers.size) : 0;
                    
                    const read_update: ChatMessage = {
                        type: 'read_update',
                        nickname: '',
                        timestamp: Date.now(),
                        message_id: message_id,
                        read_count: unread_count,
                        total_users: total_users
                    };
                    
                    broadcast(read_update);
                }
            } else if (parsed_data.type === 'whisper') {
                if (!clients.has(ws)) {
                    const reject_message: ChatMessage = {
                        type: 'join_rejected',
                        nickname: '',
                        timestamp: Date.now(),
                        reason: '먼저 입장해주세요.'
                    };
                    ws.send(JSON.stringify(reject_message));
                    return;
                }
                
                const sender_nickname = clients.get(ws);
                if (!sender_nickname) return;
                
                const target_nickname = parsed_data.target_nickname;
                const whisper_message = parsed_data.message;
                
                if (!target_nickname || (!whisper_message && !parsed_data.image_data && !parsed_data.emoji && !parsed_data.file_data)) {
                    return;
                }
                
                const whisper: ChatMessage = {
                    type: 'whisper',
                    nickname: sender_nickname,
                    target_nickname: target_nickname,
                    message: whisper_message,
                    image_data: parsed_data.image_data,
                    emoji: parsed_data.emoji,
                    file_data: parsed_data.file_data,
                    file_name: parsed_data.file_name,
                    file_size: parsed_data.file_size,
                    file_type: parsed_data.file_type,
                    timestamp: Date.now()
                };
                
                if (parsed_data.file_data) {
                    const file_data_size = parsed_data.file_data.length;
                    console.log(`[서버] 귓속말 파일 수신: ${parsed_data.file_name} (${parsed_data.file_size} bytes, base64: ${file_data_size} bytes)`);
                }
                
                sendWhisper(whisper, ws);
                console.log(`${sender_nickname} -> ${target_nickname}: ${whisper_message || parsed_data.emoji || parsed_data.file_name || '[이미지]'}`);
            }
        } catch (error) {
            console.error('메시지 파싱 오류:', error);
        }
    });

    ws.on('close', () => {
        const nickname = clients.get(ws);
        if (nickname) {
            clients.delete(ws);
            
            if (isMonitor(nickname)) {
                console.log(`[Monitor] ${nickname} disconnected`);
            } else {
                const leave_message: ChatMessage = {
                    type: 'leave',
                    nickname: nickname,
                    timestamp: Date.now()
                };
                
                broadcast(leave_message, ws);
                
                message_readers.forEach((readers) => {
                    readers.delete(nickname);
                });
                
                broadcastUserList();
                console.log(`${nickname}님이 퇴장했습니다.`);
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 클라이언트 오류:', error);
    });
});

function broadcast(message: ChatMessage, exclude_client?: WebSocket) {
    const message_string = JSON.stringify(message);
    clients.forEach((_, client) => {
        if (client !== exclude_client && client.readyState === WebSocket.OPEN) {
            try {
                client.send(message_string);
            } catch (error) {
                console.error('메시지 전송 오류:', error);
            }
        }
    });
}

function broadcastUserList() {
    const user_list = Array.from(clients.values()).filter(n => !isMonitor(n));
    const user_list_message: ChatMessage = {
        type: 'user_list',
        nickname: '',
        timestamp: Date.now(),
        user_list: user_list
    };
    const message_string = JSON.stringify(user_list_message);
    clients.forEach((nickname, client) => {
        if (client.readyState === WebSocket.OPEN && !isMonitor(nickname)) {
            try {
                client.send(message_string);
            } catch (error) {
                console.error('사용자 목록 전송 오류:', error);
            }
        }
    });
}

function sendWhisper(whisper: ChatMessage, sender_ws: WebSocket) {
    const message_string = JSON.stringify(whisper);
    const sender_nickname = clients.get(sender_ws);
    const target_nickname = whisper.target_nickname;
    
    if (!sender_nickname || !target_nickname) {
        return;
    }
    
    clients.forEach((nickname, client) => {
        if (client.readyState === WebSocket.OPEN) {
            const is_sender = client === sender_ws;
            const is_target = nickname.toLowerCase() === target_nickname.toLowerCase();
            
            if (is_sender || is_target) {
                try {
                    client.send(message_string);
                } catch (error) {
                    console.error('귓속말 전송 오류:', error);
                }
            }
        }
    });
}

wss.on('error', (error) => {
    console.error('WebSocket 서버 오류:', error);
});

