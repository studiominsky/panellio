import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './containers/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
  	container: {
  		center: true,
  		padding: '2rem'
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)'
  			],
  			mono: [
  				'var(--font-geist-mono)'
  			]
  		},
  		screens: {
  			'3xl': '1960px'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			inverted: 'rgb(var(--inverted))',
  			uiPrimary: 'hsl(var(--ui-primary))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground)) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			green: {
  				'100': '#f2fae6',
  				'200': '#d3f191',
  				'300': '#cce985',
  				'400': '#b8e057',
  				'500': '#72b014',
  				'600': '#669f12',
  				'700': '#598d10',
  				'800': '#4d7c0d',
  				'900': '#416a0b',
  				'1000': '#345808'
  			},
  			blue: {
  				'100': '#e0f3fd',
  				'200': '#b3e1fb',
  				'300': '#85cef9',
  				'400': '#58bcf7',
  				'500': '#1789db',
  				'600': '#147bc5',
  				'700': '#116dac',
  				'800': '#0e5f93',
  				'900': '#0b517a',
  				'1000': '#083361'
  			},
  			orange: {
  				'100': '#ffece0',
  				'200': '#fbc49f',
  				'300': '#ffb885',
  				'400': '#ff9e57',
  				'500': '#f5791f',
  				'600': '#d4691b',
  				'700': '#b35917',
  				'800': '#914814',
  				'900': '#703810',
  				'1000': '#4e280c'
  			},
  			red: {
  				'100': '#ffeae8',
  				'200': '#ffc8c3',
  				'300': '#ffa89e',
  				'400': '#ff8679',
  				'500': '#f24d3c',
  				'600': '#e14435',
  				'700': '#d13b2e',
  				'800': '#9d271d',
  				'900': '#741c14',
  				'1000': '#4b120c'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'slide-down': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-up': {
  				'0%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				},
  				'100%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-down': 'slide-down 0.3s ease-out',
  			'slide-up': 'slide-up 0.3s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
