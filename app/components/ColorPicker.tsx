'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ColorPickerProps {
    is_open: boolean;
    onClose: () => void;
}

export default function ColorPicker({ is_open, onClose }: ColorPickerProps) {
    const { selected_color, setSelectedColor, theme_colors } = useTheme();
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);
    const picker_ref = useRef<HTMLDivElement>(null);
    const is_dragging_ref = useRef(false);
    const [position_style, setPositionStyle] = useState<React.CSSProperties>({});

    function hexToHsl(hex: string): [number, number, number] {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return [h * 360, s * 100, l * 100];
    }

    function hslToHex(h: number, s: number, l: number): string {
        h /= 360;
        s /= 100;
        l /= 100;

        let r: number, g: number, b: number;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p: number, q: number, t: number) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = (x: number) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // selected_color가 변경될 때 내부 상태 동기화 (useEffect 대신 직접 처리)
    useEffect(() => {
        if (selected_color) {
            const [h, s, l] = hexToHsl(selected_color);
            // 상태 업데이트를 다음 틱으로 지연시켜 cascading render 방지
            requestAnimationFrame(() => {
                setHue(h);
                setSaturation(s);
                setLightness(l);
            });
        }
    }, [selected_color]);

    useEffect(() => {
        const handle_click_outside = (event: MouseEvent) => {
            // 드래그 중이면 닫지 않음
            if (is_dragging_ref.current) {
                return;
            }
            
            if (picker_ref.current && !picker_ref.current.contains(event.target as Node)) {
                // 부모 요소(버튼)도 클릭 대상에서 제외
                const target = event.target as Node;
                const parent = picker_ref.current.parentElement;
                if (parent && (parent.contains(target) || parent === target)) {
                    return;
                }
                onClose();
            }
        };

        if (is_open) {
            // mousedown 대신 click을 사용하고 약간의 지연을 둠
            const click_timeout_id = setTimeout(() => {
                document.addEventListener('click', handle_click_outside, true);
            }, 0);
            
            // 작은 화면에서 위치 조정
            const update_position = () => {
                if (picker_ref.current) {
                    const parent = picker_ref.current.parentElement;
                    if (!parent) return;
                    
                    const parent_rect = parent.getBoundingClientRect();
                    const picker_rect = picker_ref.current.getBoundingClientRect();
                    const viewport_width = window.innerWidth;
                    const viewport_height = window.innerHeight;
                    const margin = 16;
                    const picker_width = picker_rect.width || Math.min(320, viewport_width - margin * 2);
                    const picker_height = picker_rect.height || 450;
                    
                    // 부모 요소의 오른쪽 끝 위치
                    const parent_right = parent_rect.right;
                    
                    // 가로 위치 계산
                    let horizontal_style: React.CSSProperties = {};
                    if (parent_right + picker_width > viewport_width - margin) {
                        // 왼쪽 정렬로 변경 (부모 요소의 왼쪽에 맞춤)
                        const left_offset = Math.max(margin - parent_rect.left, 0);
                        horizontal_style = {
                            right: 'auto',
                            left: `${left_offset}px`,
                            transform: 'translateX(0)'
                        };
                    } else {
                        // 기본 오른쪽 정렬
                        horizontal_style = {
                            left: 'auto',
                            right: '0',
                            transform: 'translateX(0)'
                        };
                    }
                    
                    // 세로 위치 계산
                    let vertical_style: React.CSSProperties = {};
                    const space_below = viewport_height - parent_rect.bottom - margin;
                    const space_above = parent_rect.top - margin;
                    
                    // 아래로 배치할 공간이 충분한지 확인
                    if (space_below >= picker_height) {
                        // 아래로 배치
                        vertical_style = {
                            top: '100%',
                            bottom: 'auto',
                            marginTop: '0.5rem',
                            marginBottom: '0'
                        };
                    } else if (space_above >= picker_height) {
                        // 위로 배치
                        vertical_style = {
                            bottom: '100%',
                            top: 'auto',
                            marginBottom: '0.5rem',
                            marginTop: '0'
                        };
                    } else {
                        // 양쪽 모두 공간이 부족하면 더 큰 쪽에 배치하고 maxHeight로 제한
                        if (space_below >= space_above) {
                            vertical_style = {
                                top: '100%',
                                bottom: 'auto',
                                marginTop: '0.5rem',
                                marginBottom: '0',
                                maxHeight: `${space_below - 8}px`,
                                overflowY: 'auto' as const
                            };
                        } else {
                            vertical_style = {
                                bottom: '100%',
                                top: 'auto',
                                marginBottom: '0.5rem',
                                marginTop: '0',
                                maxHeight: `${space_above - 8}px`,
                                overflowY: 'auto' as const
                            };
                        }
                    }
                    
                    // 위치 스타일 병합
                    setPositionStyle({
                        ...horizontal_style,
                        ...vertical_style
                    });
                }
            };
            
            // 초기 위치 계산 (약간의 지연을 두어 DOM이 완전히 렌더링된 후 계산)
            const position_timeout_id = setTimeout(update_position, 10);
            
            // 리사이즈 시 위치 재계산
            window.addEventListener('resize', update_position);
            
            return () => {
                clearTimeout(click_timeout_id);
                clearTimeout(position_timeout_id);
                document.removeEventListener('click', handle_click_outside, true);
                window.removeEventListener('resize', update_position);
            };
        }
    }, [is_open, onClose]);

    const current_color = hslToHex(hue, saturation, lightness);

    const handle_hue_change = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const new_hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
        setHue(new_hue);
        const new_color = hslToHex(new_hue, saturation, lightness);
        setSelectedColor(new_color);
    }, [saturation, lightness, setSelectedColor]);

    const handle_sl_change = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const new_s = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const new_l = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
        setSaturation(new_s);
        setLightness(new_l);
        const new_color = hslToHex(hue, new_s, new_l);
        setSelectedColor(new_color);
    }, [hue, setSelectedColor]);

    const hue_slider_ref = useRef<HTMLDivElement>(null);
    const sl_picker_ref = useRef<HTMLDivElement>(null);
    const active_picker_ref = useRef<'hue' | 'sl' | null>(null);

    useEffect(() => {
        const handle_mouse_move = (e: MouseEvent) => {
            if (!is_dragging_ref.current || !active_picker_ref.current) return;
            
            if (active_picker_ref.current === 'hue' && hue_slider_ref.current) {
                handle_hue_change(e, hue_slider_ref.current);
            } else if (active_picker_ref.current === 'sl' && sl_picker_ref.current) {
                handle_sl_change(e, sl_picker_ref.current);
            }
        };

        const handle_mouse_up = () => {
            is_dragging_ref.current = false;
            active_picker_ref.current = null;
        };

        if (is_dragging_ref.current) {
            document.addEventListener('mousemove', handle_mouse_move);
            document.addEventListener('mouseup', handle_mouse_up);
        }

        return () => {
            document.removeEventListener('mousemove', handle_mouse_move);
            document.removeEventListener('mouseup', handle_mouse_up);
        };
    }, [handle_hue_change, handle_sl_change]);

    if (!is_open) return null;

    return (
        <div
            ref={picker_ref}
            className="absolute border rounded-lg p-3 md:p-4 shadow-lg z-50 w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-[360px] expand-animation"
            style={{ 
                backgroundColor: theme_colors.button_input_background, 
                borderColor: theme_colors.info_text,
                maxWidth: 'min(calc(100vw - 2rem), 360px)',
                ...position_style
            }}
            onClick={(e) => {
                e.stopPropagation();
            }}
            onMouseDown={(e) => {
                e.stopPropagation();
            }}
        >
            <div className="mb-3 md:mb-4">
                <h3 className="text-xs md:text-sm mb-2 md:mb-3" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                    테마 색상 선택
                </h3>
                
                {/* 원형 색상 스펙트럼 */}
                <div className="mb-3 md:mb-4">
                    <div 
                        ref={hue_slider_ref}
                        className="relative w-full h-6 md:h-8 rounded-full overflow-hidden mb-2 cursor-pointer"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            is_dragging_ref.current = true;
                            active_picker_ref.current = 'hue';
                            if (hue_slider_ref.current) {
                                handle_hue_change(e, hue_slider_ref.current);
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            background: `linear-gradient(to right, 
                                hsl(0, 100%, 50%), 
                                hsl(60, 100%, 50%), 
                                hsl(120, 100%, 50%), 
                                hsl(180, 100%, 50%), 
                                hsl(240, 100%, 50%), 
                                hsl(300, 100%, 50%), 
                                hsl(360, 100%, 50%))`
                        }}
                    >
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg pointer-events-none"
                            style={{
                                left: `${(hue / 360) * 100}%`,
                                transform: 'translateY(-50%)'
                            }}
                        />
                    </div>
                    
                    {/* 채도/명도 선택 영역 */}
                    <div
                        ref={sl_picker_ref}
                        className="relative w-full h-24 md:h-32 rounded cursor-pointer mb-2 overflow-hidden"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            is_dragging_ref.current = true;
                            active_picker_ref.current = 'sl';
                            if (sl_picker_ref.current) {
                                handle_sl_change(e, sl_picker_ref.current);
                            }
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{
                            background: `linear-gradient(to top, 
                                hsl(${hue}, 100%, 0%), 
                                hsl(${hue}, 100%, 50%), 
                                hsl(${hue}, 100%, 100%)),
                                linear-gradient(to right, 
                                hsl(${hue}, 0%, 50%), 
                                hsl(${hue}, 100%, 50%))`
                        }}
                    >
                        <div
                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
                            style={{
                                left: `${saturation}%`,
                                top: `${100 - lightness}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    </div>
                </div>

                {/* 현재 선택된 색상 미리보기 */}
                <div className="mb-3 md:mb-4">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div
                            className="w-12 h-12 md:w-16 md:h-16 rounded border-2 flex-shrink-0"
                            style={{
                                backgroundColor: current_color,
                                borderColor: theme_colors.info_text
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-xs mb-1" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                선택된 색상
                            </div>
                            <div className="text-xs md:text-sm font-mono break-all" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                {current_color.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 생성된 테마 색상 미리보기 */}
                <div className="mb-0">
                    <div className="text-xs mb-2" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        테마 색상 미리보기
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                        <div className="space-y-1">
                            <div className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                배경
                            </div>
                            <div
                                className="h-8 rounded border"
                                style={{
                                    backgroundColor: theme_colors.chat_background,
                                    borderColor: theme_colors.info_text
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                입력 바
                            </div>
                            <div
                                className="h-8 rounded border"
                                style={{
                                    backgroundColor: theme_colors.input_bar_background,
                                    borderColor: theme_colors.info_text
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                버튼
                            </div>
                            <div
                                className="h-8 rounded border"
                                style={{
                                    backgroundColor: theme_colors.button_input_background,
                                    borderColor: theme_colors.info_text
                                }}
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="text-xs" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                텍스트
                            </div>
                            <div
                                className="h-8 rounded border flex items-center justify-center text-xs"
                                style={{
                                    backgroundColor: theme_colors.button_input_background,
                                    borderColor: theme_colors.info_text,
                                    color: theme_colors.input_text
                                }}
                            >
                                샘플
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

