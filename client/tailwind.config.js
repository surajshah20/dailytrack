/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        background: token('bg'),
        surface: token('surface'),
        muted: token('muted'),
        border: token('border'),
        'border-strong': token('border-strong'),
        fg: token('fg'),
        'fg-muted': token('fg-muted'),
        'fg-subtle': token('fg-subtle'),
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          subtle: token('accent-subtle'),
          fg: token('accent-fg'),
        },
        success: { DEFAULT: token('success'), subtle: token('success-subtle') },
        warning: { DEFAULT: token('warning'), subtle: token('warning-subtle') },
        danger: { DEFAULT: token('danger'), subtle: token('danger-subtle') },

        // Legacy aliases so existing pages keep working. Remove after Phase 7.
        'surface-elevated': token('muted'),
        primary: {
          50: token('accent-subtle'),
          500: token('accent'),
          600: token('accent'),
          700: token('accent-hover'),
        },
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '10px',
        '2xl': '12px',
        '3xl': '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        DEFAULT: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 2px 4px -1px rgb(0 0 0 / 0.06)',
        lg: '0 4px 8px -2px rgb(0 0 0 / 0.08)',
        xl: '0 8px 16px -4px rgb(0 0 0 / 0.10)',
        '2xl': '0 8px 16px -4px rgb(0 0 0 / 0.10)',
      },
    },
  },
  plugins: [],
};