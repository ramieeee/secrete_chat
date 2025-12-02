export interface ThemeColors {
    chat_background: string;
    input_bar_background: string;
    button_input_background: string;
    input_text: string;
    info_text: string;
}

/**
 * HSL 색상을 RGB로 변환
 */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
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

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * RGB를 HEX로 변환
 */
function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
}

/**
 * HEX 색상을 HSL로 변환
 */
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

/**
 * 선택한 색상으로부터 테마 색상 생성
 * @param selected_color - HEX 색상 코드 (예: #ff0000)
 * @returns 테마 색상 객체
 */
export function generateThemeColors(selected_color: string): ThemeColors {
    const [h, s, l] = hexToHsl(selected_color);

    // 채팅 배경: 매우 어두운 색상 (L: 5-10%)
    const chat_bg_l = Math.max(5, Math.min(10, l * 0.3));
    const [r1, g1, b1] = hslToRgb(h, s * 0.3, chat_bg_l);
    const chat_background = rgbToHex(r1, g1, b1);

    // 입력/상단 바 배경: 어두운 색상 (L: 12-18%)
    const input_bar_l = Math.max(12, Math.min(18, l * 0.4));
    const [r2, g2, b2] = hslToRgb(h, s * 0.4, input_bar_l);
    const input_bar_background = rgbToHex(r2, g2, b2);

    // 버튼/입력 필드: 중간 어두운 색상 (L: 15-25%)
    const button_l = Math.max(15, Math.min(25, l * 0.5));
    const [r3, g3, b3] = hslToRgb(h, s * 0.5, button_l);
    const button_input_background = rgbToHex(r3, g3, b3);

    // 입력 텍스트: 밝은 색상 (L: 85-95%)
    const text_l = Math.max(85, Math.min(95, 100 - l * 0.2));
    const [r4, g4, b4] = hslToRgb(h, s * 0.1, text_l);
    const input_text = rgbToHex(r4, g4, b4);

    // 정보성 텍스트: 중간 밝기 (L: 50-65%)
    const info_l = Math.max(50, Math.min(65, l * 1.2));
    const [r5, g5, b5] = hslToRgb(h, s * 0.3, info_l);
    const info_text = rgbToHex(r5, g5, b5);

    return {
        chat_background,
        input_bar_background,
        button_input_background,
        input_text,
        info_text
    };
}

/**
 * 기본 테마 색상 (검은색 계열)
 */
export const defaultThemeColors: ThemeColors = {
    chat_background: '#0a0a0f',
    input_bar_background: '#0f172a',
    button_input_background: '#1e293b',
    input_text: '#e2e8f0',
    info_text: '#64748b'
};

