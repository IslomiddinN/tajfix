import type { Config } from 'tailwindcss';
import preset from '../../tailwind-preset';

const config: Config = {
  presets: [preset as Config],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    '../../components/**/*.{js,ts,jsx,tsx}',
    '../../app-shell/**/*.{js,ts,jsx,tsx}'
  ]
};

export default config;
