import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();
        
        if (!prompt) {
            return NextResponse.json(
                { error: '프롬프트가 필요합니다.' },
                { status: 400 }
            );
        }
        
        const response = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'hf.co/unsloth/Qwen3-4B-Instruct-2507-GGUF',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const error_text = await response.text();
            console.error('Ollama API 오류:', error_text);
            return NextResponse.json(
                { error: 'AI 서버 응답 오류', details: error_text },
                { status: response.status }
            );
        }
        
        const data = await response.json();
        return NextResponse.json(data);
        
    } catch (error) {
        console.error('AI API 오류:', error);
        return NextResponse.json(
            { error: 'AI 서버에 연결할 수 없습니다.', details: String(error) },
            { status: 500 }
        );
    }
}

