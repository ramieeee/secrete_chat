'use client';

import { useState } from 'react';
import NicknameInput from './components/NicknameInput';
import ChatRoom from './components/ChatRoom';

export default function Home() {
    const [nickname, setNickname] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleJoin = (entered_nickname: string) => {
        setNickname(entered_nickname);
        setErrorMessage(null);
    };

    const handleDisconnect = (errorMessage?: string) => {
        setNickname(null);
        if (errorMessage) {
            setErrorMessage(errorMessage);
        }
    };

    if (!nickname) {
        return <NicknameInput onJoin={handleJoin} errorMessage={errorMessage} />;
    }

    return <ChatRoom nickname={nickname} onDisconnect={handleDisconnect} />;
}

