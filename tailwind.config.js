module.exports = {
	mode: 'jit',
	content: [
		'./app/components/**/*.erb',
		'./app/views/**/*.html.erb',
		'./app/helpers/**/*.rb',
		'./app/assets/stylesheets/**/*.css',
		'./app/javascript/**/*.js',
		'node_modules/preline/dist/*.js',
	],
	theme: {
		extend: {
			colors: {
				gold: {
					DEFAULT: '#CE973E',
					50: '#F3E6D0',
					100: '#EFDDC0',
					200: '#E7CCA0',
					300: '#DFBA7F',
					400: '#D6A95F',
					500: '#CE973E',
					600: '#A9792B',
					700: '#7C5920',
					800: '#503914',
					900: '#231909',
				},
				primary: 'rgb(var(--color-primary) / <alpha-value>)',
				secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
				tertiary: 'rgb(var(--color-tertiary) / <alpha-value>)',
				accent: 'rgb(var(--color-accent) / <alpha-value>)',
			},
		},
		// colors: {
		// },
	},
	plugins: [
		require('preline/plugin'),
		require('@tailwindcss/typography'),
		require('@tailwindcss/forms'),
	],
};
