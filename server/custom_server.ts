import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

interface ChatMessage {
    type: 'message' | 'join' | 'leave' | 'join_rejected' | 'user_list' | 'whisper';
    nickname: string;
    message?: string;
    timestamp: number;
    reason?: string;
    user_list?: string[];
    target_nickname?: string;
}

const clients = new Map<WebSocket, string>();

const temp_images = new Map<string, { data: string; mime_type: string }>();

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsed_url = parse(req.url!, true);
            
            if (req.method === 'POST' && parsed_url.pathname === '/api/temp-image') {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { image_data } = JSON.parse(body);
                        if (!image_data) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'No image data' }));
                            return;
                        }
                        
                        const match = image_data.match(/^data:([^;]+);base64,(.+)$/);
                        if (!match) {
                            res.statusCode = 400;
                            res.end(JSON.stringify({ error: 'Invalid image format' }));
                            return;
                        }
                        
                        const mime_type = match[1];
                        const base64_data = match[2];
                        const id = generateId();
                        
                        temp_images.set(id, { data: base64_data, mime_type });
                        
                        setTimeout(() => {
                            temp_images.delete(id);
                            console.log(`Temp image ${id} deleted`);
                        }, 60000);
                        
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ url: `/api/temp-image/${id}` }));
                        console.log(`Temp image ${id} created (expires in 60s)`);
                    } catch (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Server error' }));
                    }
                });
                return;
            }
            
            if (req.method === 'GET' && parsed_url.pathname?.startsWith('/api/temp-image/')) {
                const id = parsed_url.pathname.split('/').pop();
                const image = id ? temp_images.get(id) : null;
                
                if (!image) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<html><body style="background:#1a1a2e;color:#fff;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif"><h2>Image expired or not found</h2></body></html>');
                    return;
                }
                
                const buffer = Buffer.from(image.data, 'base64');
                res.setHeader('Content-Type', image.mime_type);
                res.setHeader('Content-Length', buffer.length);
                res.end(buffer);
                return;
            }
            
            await handle(req, res, parsed_url);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const wss = new WebSocketServer({ 
        server,
        path: '/api/ws',
        perMessageDeflate: false,
        clientTracking: true
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
                        timestamp: Date.now()
                    };
                    
                    broadcast(chat_message);
                    console.log(`${nickname}: ${parsed_data.message}`);
                } else if (parsed_data.type === 'whisper') {
                    const sender_nickname = clients.get(ws) || '익명';
                    const target_nickname = parsed_data.target_nickname;
                    const whisper_message = parsed_data.message;
                    
                    if (!target_nickname || !whisper_message) {
                        return;
                    }
                    
                    const whisper: ChatMessage = {
                        type: 'whisper',
                        nickname: sender_nickname,
                        target_nickname: target_nickname,
                        message: whisper_message,
                        timestamp: Date.now()
                    };
                    
                    sendWhisper(whisper, ws);
                    console.log(`${sender_nickname} -> ${target_nickname}: ${whisper_message}`);
                }
            } catch (error) {
                console.error('메시지 파싱 오류:', error);
            }
        });

        ws.on('close', () => {
            const nickname = clients.get(ws);
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

    server.on('error', (err) => {
        console.error('서버 오류:', err);
    });

    server.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> WebSocket ready on ws://${hostname}:${port}/api/ws`);
    });
});

