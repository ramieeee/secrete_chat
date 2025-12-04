"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const SERVER_URL_KEY = 'secreteChat.serverUrl';
function activate(context) {
    console.log('[Secrete Chat] Extension is activating...');
    const provider = new ChatViewProvider(context.extensionUri, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider, {
        webviewOptions: {
            retainContextWhenHidden: true
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('secreteChat.openChat', () => {
        console.log('[Secrete Chat] Opening chat view...');
        vscode.commands.executeCommand('workbench.view.extension.secrete-chat');
    }));
    console.log('[Secrete Chat] Extension activated successfully!');
}
class ChatViewProvider {
    _extensionUri;
    _context;
    static viewType = 'secreteChat.chatView';
    _view;
    constructor(_extensionUri, _context) {
        this._extensionUri = _extensionUri;
        this._context = _context;
        console.log('[Secrete Chat] ChatViewProvider initialized');
    }
    resolveWebviewView(webviewView, _context, _token) {
        console.log('[Secrete Chat] resolveWebviewView called');
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        this._updateWebview();
        webviewView.webview.onDidReceiveMessage(async (message) => {
            console.log('[Secrete Chat] Received message:', message);
            if (message.type === 'openExternal' && message.url) {
                vscode.env.openExternal(vscode.Uri.parse(message.url));
            }
            else if (message.type === 'openSimpleBrowser' && message.url) {
                console.log('[Secrete Chat] Opening Simple Browser:', message.url);
                vscode.commands.executeCommand('simpleBrowser.show', message.url);
            }
            else if (message.type === 'openImage' && message.url) {
                console.log('[Secrete Chat] Opening Image in Simple Browser');
                vscode.commands.executeCommand('simpleBrowser.show', message.url);
            }
            else if (message.type === 'saveUrl' && message.url) {
                await this._context.globalState.update(SERVER_URL_KEY, message.url);
                this._updateWebview();
            }
            else if (message.type === 'resetUrl') {
                await this._context.globalState.update(SERVER_URL_KEY, undefined);
                this._updateWebview();
            }
            else if (message.type === 'refresh') {
                this._updateWebview();
            }
        });
        webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this._updateWebview();
            }
        });
    }
    _updateWebview() {
        if (this._view) {
            const saved_url = this._context.globalState.get(SERVER_URL_KEY);
            this._view.webview.html = this._getHtmlForWebview(saved_url);
        }
    }
    _getHtmlForWebview(saved_url) {
        if (saved_url) {
            return this._getChatHtml(saved_url);
        }
        return this._getUrlInputHtml();
    }
    _getUrlInputHtml() {
        const default_url = 'http://172.29.12.119:3000';
        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
            height: 100%; width: 100%; 
            background: #181818; 
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .container {
            height: 100%;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 24px;
            animation: fadeIn 0.4s ease-out;
        }
        .icon {
            width: 56px; height: 56px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            animation: float 3s ease-in-out infinite;
        }
        .icon svg {
            width: 28px; height: 28px;
            fill: white;
        }
        .title {
            color: #e0e0e0;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 6px;
            letter-spacing: -0.3px;
        }
        .subtitle {
            color: #6e6e6e;
            font-size: 12px;
            margin-bottom: 24px;
            text-align: center;
        }
        .input-group {
            width: 100%;
            max-width: 280px;
            animation: fadeIn 0.5s ease-out 0.1s both;
        }
        .label {
            color: #888;
            font-size: 11px;
            margin-bottom: 8px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .input-wrapper {
            position: relative;
            background: #1f1f1f;
            border-radius: 12px;
            padding: 2px;
            box-shadow: 
                inset 2px 2px 4px #111,
                inset -1px -1px 3px #2a2a2a;
        }
        input {
            width: 100%;
            padding: 12px 14px;
            background: #232323;
            border: none;
            border-radius: 10px;
            color: #e0e0e0;
            font-size: 13px;
            outline: none;
            transition: all 0.2s ease;
        }
        input:focus {
            background: #282828;
            box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
        }
        input::placeholder {
            color: #555;
        }
        button {
            width: 100%;
            max-width: 280px;
            margin-top: 16px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 12px;
            color: white;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            animation: fadeIn 0.5s ease-out 0.2s both;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }
        button:active {
            transform: translateY(0);
        }
        button:disabled {
            background: linear-gradient(135deg, #3c3c3c 0%, #2d2d2d 100%);
            box-shadow: none;
            cursor: not-allowed;
            transform: none;
        }
        .spinner {
            width: 14px; height: 14px;
            border: 2px solid transparent;
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
        }
        button:disabled .spinner {
            display: block;
        }
        button:disabled .btn-text {
            display: none;
        }
        .btn-icon {
            font-size: 14px;
        }
        .error {
            color: #f04c4d;
            font-size: 11px;
            margin-top: 12px;
            padding: 8px 12px;
            background: rgba(240, 76, 77, 0.1);
            border-radius: 8px;
            display: none;
            animation: fadeIn 0.2s ease-out;
        }
        .hint {
            color: #555;
            font-size: 10px;
            margin-top: 20px;
            text-align: center;
            animation: fadeIn 0.5s ease-out 0.3s both;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
        </div>
        <div class="title">Secrete Chat</div>
        <div class="subtitle">채팅 서버에 연결하세요</div>
        <div class="input-group">
            <label class="label">서버 주소</label>
            <div class="input-wrapper">
                <input type="text" id="urlInput" value="${default_url}" placeholder="http://localhost:3000">
            </div>
        </div>
        <button id="connectBtn">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">연결하기</span>
            <div class="spinner"></div>
        </button>
        <div class="error" id="error"></div>
        <div class="hint">서버가 실행 중인지 확인하세요</div>
    </div>
    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const input = document.getElementById('urlInput');
            const btn = document.getElementById('connectBtn');
            const error = document.getElementById('error');

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') connect();
            });

            input.addEventListener('input', () => {
                error.style.display = 'none';
            });

            btn.addEventListener('click', connect);

            function connect() {
                const url = input.value.trim();
                if (!url) {
                    showError('URL을 입력하세요');
                    return;
                }
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    showError('http:// 또는 https://로 시작해야 합니다');
                    return;
                }
                btn.disabled = true;
                error.style.display = 'none';

                vscode.postMessage({ type: 'saveUrl', url: url });
            }

            function showError(msg) {
                error.textContent = msg;
                error.style.display = 'block';
                btn.disabled = false;
            }
        })();
    </script>
</body>
</html>`;
    }
    _getChatHtml(server_url) {
        return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src *; connect-src *; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
    <style>
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes dots {
            0%, 20% { content: '.'; }
            40% { content: '..'; }
            60%, 100% { content: '...'; }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { 
            height: 100%; width: 100%; 
            background: #181818; 
            overflow: hidden;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        .header {
            height: 36px;
            background: linear-gradient(180deg, #1f1f1f 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            border-bottom: 1px solid #2a2a2a;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .server-info {
            display: flex;
            align-items: center;
            gap: 6px;
            overflow: hidden;
            flex: 1;
        }
        .status-dot {
            width: 6px; height: 6px;
            background: #4caf50;
            border-radius: 50%;
            box-shadow: 0 0 6px rgba(76, 175, 80, 0.5);
            animation: pulse 2s ease-in-out infinite;
        }
        .status-dot.connecting {
            background: #ff9800;
            box-shadow: 0 0 6px rgba(255, 152, 0, 0.5);
        }
        .server-url {
            color: #888;
            font-size: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .header-buttons {
            display: flex;
            gap: 4px;
        }
        .header-btn {
            background: transparent;
            border: 1px solid #3a3a3a;
            border-radius: 6px;
            color: #888;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .header-btn:hover {
            background: #2a2a2a;
            border-color: #444;
            color: #ccc;
        }
        .header-btn:active {
            transform: scale(0.95);
        }
        .header-btn svg {
            width: 12px;
            height: 12px;
            fill: currentColor;
        }
        .header-btn.spinning svg {
            animation: spin 0.8s linear infinite;
        }
        .content {
            height: calc(100% - 36px);
            position: relative;
            animation: fadeIn 0.3s ease-out;
        }
        .status {
            height: 100%;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            color: #ccc;
        }
        .loading-icon {
            width: 48px; height: 48px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            animation: pulse 1.5s ease-in-out infinite;
        }
        .loading-icon svg {
            width: 24px; height: 24px;
            fill: white;
        }
        .loading-text { 
            font-size: 13px; 
            margin-bottom: 4px;
            color: #aaa;
        }
        .loading-text::after {
            content: '';
            animation: dots 1.5s steps(1) infinite;
        }
        .retry { 
            font-size: 11px; 
            color: #666;
            margin-top: 4px;
        }
        iframe { 
            width: 100%; height: 100%; 
            border: none; 
            display: none;
            animation: fadeIn 0.3s ease-out;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="server-info">
            <div class="status-dot connecting" id="statusDot"></div>
            <span class="server-url">${server_url}</span>
        </div>
        <div class="header-buttons">
            <button class="header-btn" id="refreshBtn" title="새로고침">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
            </button>
            <button class="header-btn" id="changeBtn" title="서버 변경">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
            </button>
        </div>
    </div>
    <div class="content">
        <div class="status" id="status">
            <div class="loading-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                    <path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                </svg>
            </div>
            <div class="loading-text">서버 연결 중</div>
            <div class="retry" id="retry">시도 1회</div>
        </div>
        <iframe id="frame" src="${server_url}"></iframe>
    </div>
    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const frame = document.getElementById('frame');
            const status = document.getElementById('status');
            const retry = document.getElementById('retry');
            const changeBtn = document.getElementById('changeBtn');
            const refreshBtn = document.getElementById('refreshBtn');
            const statusDot = document.getElementById('statusDot');
            const url = '${server_url}';
            let count = 0, interval = null;

            changeBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'resetUrl' });
            });

            refreshBtn.addEventListener('click', () => {
                refreshBtn.classList.add('spinning');
                frame.src = url;
                status.style.display = 'flex';
                frame.style.display = 'none';
                statusDot.classList.add('connecting');
                count = 0;
                if (!interval) {
                    interval = setInterval(check, 1000);
                }
                setTimeout(() => {
                    refreshBtn.classList.remove('spinning');
                }, 800);
            });

            function check() {
                count++;
                retry.textContent = '시도 ' + count + '회';
                fetch(url, { mode: 'no-cors' }).then(() => show()).catch(() => {});
            }
            function show() {
                frame.style.display = 'block';
                status.style.display = 'none';
                statusDot.classList.remove('connecting');
                if (interval) { clearInterval(interval); interval = null; }
            }
            frame.onload = show;
            interval = setInterval(check, 1000);
            check();

            window.addEventListener('message', (e) => {
                if (e.data && e.data.type === 'openUrl') {
                    vscode.postMessage({ type: 'openSimpleBrowser', url: e.data.url });
                }
            });
        })();
    </script>
</body>
</html>`;
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map