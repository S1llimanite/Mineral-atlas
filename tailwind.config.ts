import type { Config } from 'tailwindcss';

/**
 * 「Mineral Gallery Light」v0.4 设计系统
 * 浅色为默认主题（mineral gallery 风格），深色作为 alternate 主题（Deep Crystal）。
 * 颜色全部映射到 CSS Variables，由 globals.css 中的主题定义驱动。
 */
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg)',
        slate9: 'var(--bg-card)',
        slate8: 'var(--bg-section)',
        slate7: 'var(--bg-hover)',
        slate6: 'var(--bg-input)',
        moon: { DEFAULT: 'var(--primary)', dim: 'var(--primary-2)' },
        emerald: { crystal: 'var(--primary-2)' },
        amber: { gold: 'var(--accent)' },
        rust: '#B85A4A',
        ink: { bright: 'var(--ink)', mid: 'var(--ink-mid)', faint: 'var(--ink-faint)' },
        status: {
          verified: 'var(--st-verified)',
          reviewed: 'var(--st-reviewed)',
          provisional: 'var(--st-provisional)',
          schematic: 'var(--st-schematic)',
          draft: 'var(--st-draft)',
          missing: 'var(--st-missing)',
        },
      },
      borderColor: {
        hair: 'var(--border)',
        hair2: 'var(--border-2)',
        accent: 'color-mix(in srgb, var(--primary) 35%, transparent)',
      },
      boxShadow: {
        panel: 'var(--shadow-1)',
        float: 'var(--shadow-2)',
        glowMoon: '0 4px 16px color-mix(in srgb, var(--primary) 18%, transparent)',
        lift: 'var(--shadow-3)',
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans SC"', 'system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: { crystal: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { fadeUp: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' },
    },
  },
  plugins: [],
};
export default config;