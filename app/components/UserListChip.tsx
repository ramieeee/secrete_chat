'use client';

import { useState, useEffect, useRef } from 'react';

interface UserListChipProps {
    user_count: number;
    user_list: string[];
}

export default function UserListChip({ user_count, user_list }: UserListChipProps) {
    const [is_expanded, setIsExpanded] = useState(false);
    const container_ref = useRef<HTMLDivElement>(null);

    const toggle_expand = () => {
        setIsExpanded(!is_expanded);
    };

    useEffect(() => {
        const handle_click_outside = (event: MouseEvent) => {
            if (container_ref.current && !container_ref.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (is_expanded) {
            document.addEventListener('mousedown', handle_click_outside);
        }

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [is_expanded]);

    return (
        <div ref={container_ref} className="fixed top-16 left-2 md:top-4 md:left-4 z-50">
            <button
                onClick={toggle_expand}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono hover:bg-slate-800 transition-colors md:px-3 md:py-1.5"
            >
                <span className="hidden md:inline">현재 사용자: </span>{user_count}명
            </button>
            
            {is_expanded && (
                <div className="absolute top-12 left-0 bg-slate-900 border border-slate-700 rounded-lg p-4 min-w-[200px] shadow-lg expand-animation">
                    <div className="mb-3 pb-2 border-b border-slate-700">
                        <h3 className="text-sm font-bold text-slate-300 font-mono">접속 중인 사용자</h3>
                        <p className="text-xs text-slate-500 mt-1">총 {user_count}명</p>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {user_list.map((user, index) => (
                            <div
                                key={index}
                                className="text-sm text-slate-300 font-mono py-1 px-2 rounded bg-slate-800/50 border border-slate-700/50 fade-in-animation"
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    animationFillMode: 'both',
                                }}
                            >
                                &gt; {user}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

