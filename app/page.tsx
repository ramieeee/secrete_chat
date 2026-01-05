'use client';

import { useState } from 'react';
import NicknameInput from './components/NicknameInput';
import ChatRoom from './components/ChatRoom';

export default function Home() {
    const [nickname, setNickname] = useState<string | null>(null);
    const [server_url, setServerUrl] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleJoin = (entered_nickname: string, entered_server_url: string, entered_password: string) => {
        setNickname(entered_nickname);
        setServerUrl(entered_server_url);
        setPassword(entered_password);
        setErrorMessage(null);
    };

    const handleDisconnect = (errorMessage?: string) => {
        setNickname(null);
        setPassword(null);
        if (errorMessage) {
            setErrorMessage(errorMessage);
        }
    };

    if (!nickname || !server_url || !password) {
        return <NicknameInput onJoin={handleJoin} errorMessage={errorMessage} />;
    }

    return <ChatRoom nickname={nickname} server_url={server_url} password={password} onDisconnect={handleDisconnect} />;
}
