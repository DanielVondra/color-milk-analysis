import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {}
	},

	safelist: [
		'bg-[#16a34a]',
		'bg-[#dc2626]',
		'bg-slate-600'
	],

	plugins: [typography, forms]
} satisfies Config;
