'use client';

interface SystemMessageProps {
    message: string;
}

export default function SystemMessage({ message }: SystemMessageProps) {
    return (
        <div className="flex justify-center mb-4">
            <div className="bg-slate-900 border border-slate-700 rounded-full px-4 py-2">
                <p className="text-xs text-slate-500 text-center font-mono font-bold">{message}</p>
            </div>
        </div>
    );
}

