'use client';

import { useState, useRef, useEffect } from 'react';
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

    useEffect(() => {
        if (selected_color) {
            const [h, s, l] = hexToHsl(selected_color);
            setHue(h);
            setSaturation(s);
            setLightness(l);
        }
    }, [selected_color]);

    useEffect(() => {
        const handle_click_outside = (event: MouseEvent) => {
            if (picker_ref.current && !picker_ref.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (is_open) {
            document.addEventListener('mousedown', handle_click_outside);
        }

        return () => {
            document.removeEventListener('mousedown', handle_click_outside);
        };
    }, [is_open, onClose]);

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

    const current_color = hslToHex(hue, saturation, lightness);

    const handle_hue_change = (e: React.MouseEvent<HTMLDivElement> | MouseEvent, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const new_hue = Math.max(0, Math.min(360, (x / rect.width) * 360));
        setHue(new_hue);
        const new_color = hslToHex(new_hue, saturation, lightness);
        setSelectedColor(new_color);
    };

    const handle_sl_change = (e: React.MouseEvent<HTMLDivElement> | MouseEvent, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const new_s = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const new_l = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
        setSaturation(new_s);
        setLightness(new_l);
        const new_color = hslToHex(hue, new_s, new_l);
        setSelectedColor(new_color);
    };

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
    }, [hue, saturation, lightness]);

    if (!is_open) return null;

    return (
        <div
            ref={picker_ref}
            className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg z-50 min-w-[320px] expand-animation"
            style={{ backgroundColor: theme_colors.button_input_background, borderColor: theme_colors.info_text }}
        >
            <div className="mb-4">
                <h3 className="text-sm mb-3" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                    테마 색상 선택
                </h3>
                
                {/* 원형 색상 스펙트럼 */}
                <div className="mb-4">
                    <div 
                        ref={hue_slider_ref}
                        className="relative w-full h-8 rounded-full overflow-hidden mb-2 cursor-pointer"
                        onMouseDown={(e) => {
                            is_dragging_ref.current = true;
                            active_picker_ref.current = 'hue';
                            if (hue_slider_ref.current) {
                                handle_hue_change(e, hue_slider_ref.current);
                            }
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
                        className="relative w-full h-32 rounded cursor-pointer mb-2 overflow-hidden"
                        onMouseDown={(e) => {
                            is_dragging_ref.current = true;
                            active_picker_ref.current = 'sl';
                            if (sl_picker_ref.current) {
                                handle_sl_change(e, sl_picker_ref.current);
                            }
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
                <div className="mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-16 h-16 rounded border-2"
                            style={{
                                backgroundColor: current_color,
                                borderColor: theme_colors.info_text
                            }}
                        />
                        <div className="flex-1">
                            <div className="text-xs mb-1" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                선택된 색상
                            </div>
                            <div className="text-sm font-mono" style={{ color: theme_colors.input_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                                {current_color.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 생성된 테마 색상 미리보기 */}
                <div className="mb-4">
                    <div className="text-xs mb-2" style={{ color: theme_colors.info_text, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                        테마 색상 미리보기
                    </div>
                    <div className="grid grid-cols-2 gap-2">
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

