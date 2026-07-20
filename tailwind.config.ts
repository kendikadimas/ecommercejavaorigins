import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'java-dark': '#140E0A',
        'java-brown': '#231911',
        'java-card': '#2E2016',
        'java-gold': '#FACC15',
        'java-gold-dark': '#EAB308',
        'java-gold-light': '#FDE047',
        'java-cream': '#FAFAF7',
        'java-sand': '#F5EFE6',
        'java-text': '#2A2016',
        'java-muted': '#786C60',
      },
      fontFamily: {
        serif: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
