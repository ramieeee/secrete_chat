import { WebSocketServer, WebSocket } from 'ws';

interface ChatMessage {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper';
    nickname: string;
    message?: string;
    timestamp: number;
    reason?: string;
    user_list?: string[];
    target_nickname?: string;
    image_data?: string;
    emoji?: string;
}

const wss = new WebSocketServer({ 
    host: '0.0.0.0',
    port: 9999,
    perMessageDeflate: false,
    clientTracking: true
});

const clients = new Map<WebSocket, string>();

wss.on('listening', () => {
    console.log('웹소켓 서버가 포트 9999에서 실행 중입니다.');
});

wss.on('connection', (ws: WebSocket) => {
    console.log('새 클라이언트 연결');

    ws.on('message', (data: Buffer) => {
        try {
            const parsed_data = JSON.parse(data.toString());
            
            if (parsed_data.type === 'join') {
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
                
                const is_duplicate = Array.from(clients.values()).some(
                    (existing_nickname) => existing_nickname.toLowerCase() === trimmed_nickname.toLowerCase()
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
                
                const join_message: ChatMessage = {
                    type: 'join',
                    nickname: trimmed_nickname,
                    timestamp: Date.now()
                };
                
                broadcast(join_message, ws);
                broadcastUserList();
                console.log(`${trimmed_nickname}님이 입장했습니다.`);
            } else if (parsed_data.type === 'message') {
                const nickname = clients.get(ws) || '익명';
                const chat_message: ChatMessage = {
                    type: 'message',
                    nickname: nickname,
                    message: parsed_data.message,
                    image_data: parsed_data.image_data,
                    emoji: parsed_data.emoji,
                    timestamp: Date.now()
                };
                
                broadcast(chat_message);
                console.log(`${nickname}: ${parsed_data.message}${parsed_data.image_data ? ' (이미지 포함)' : ''}${parsed_data.emoji ? ' (이모티콘 포함)' : ''}`);
            } else if (parsed_data.type === 'whisper') {
                const sender_nickname = clients.get(ws) || '익명';
                const target_nickname = parsed_data.target_nickname;
                const whisper_message = parsed_data.message;
                
                if (!target_nickname || (!whisper_message && !parsed_data.image_data && !parsed_data.emoji)) {
                    return;
                }
                
                const whisper: ChatMessage = {
                    type: 'whisper',
                    nickname: sender_nickname,
                    target_nickname: target_nickname,
                    message: whisper_message,
                    image_data: parsed_data.image_data,
                    emoji: parsed_data.emoji,
                    timestamp: Date.now()
                };
                
                sendWhisper(whisper, ws);
                console.log(`${sender_nickname} -> ${target_nickname}: ${whisper_message || parsed_data.emoji || '[이미지]'}`);
            }
        } catch (error) {
            console.error('메시지 파싱 오류:', error);
        }
    });

    ws.on('close', (code: number, reason: string) => {
        const nickname = clients.get(ws);
        console.log(`${nickname}님이 퇴장했습니다.`, reason);
        if (nickname) {
            const leave_message: ChatMessage = {
                type: 'leave',
                nickname: nickname,
                timestamp: Date.now()
            };
            
            broadcast(leave_message, ws);
            clients.delete(ws);
            broadcastUserList();
            console.log(`${nickname}님이 퇴장했습니다.`);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 클라이언트 오류:', error);
    });
});

function broadcast(message: ChatMessage, exclude_client?: WebSocket) {
    const message_string = JSON.stringify(message);
    let sent_count = 0;
    clients.forEach((_, client) => {
        if (client !== exclude_client && client.readyState === WebSocket.OPEN) {
            try {
                client.send(message_string);
                sent_count++;
            } catch (error) {
                console.error('메시지 전송 오류:', error);
            }
        }
    });
    console.log(`메시지 브로드캐스트: ${sent_count}명에게 전송`);
}

function broadcastUserList() {
    const user_list = Array.from(clients.values());
    const user_list_message: ChatMessage = {
        type: 'user_list',
        nickname: '',
        timestamp: Date.now(),
        user_list: user_list
    };
    const message_string = JSON.stringify(user_list_message);
    clients.forEach((_, client) => {
        if (client.readyState === WebSocket.OPEN) {
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

