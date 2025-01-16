module.exports = {
    darkMode: ['class'],
    content: [
		'./src/*.{html,js,jsx,ts,tsx}',
		'./src/**/*.{html,js,jsx,ts,tsx}',
		'./src/**/**/*.{html,js,jsx,ts,tsx}',
		'./src/**/**/**/*.{html,js,jsx,ts,tsx}',
		'./src/**/**/**/**/*.{html,js,jsx,ts,tsx',
		'./src/**/**/**/**/**/*.{html,js,jsx,ts,tsx'

	],
  theme: {
  	extend: {
  		borderColor: {
  			border: '#ccc'
  		},
  		colors: {
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		}
  	}
  },
  plugins: [],
};
