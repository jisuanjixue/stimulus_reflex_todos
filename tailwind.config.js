module.exports = {
  content: [
    './app/views/**/*.{rb,erb,js}',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js',
    './app/components/**/*.rb',
    './app/components/**/*.html.erb',
  ],
  variants: {
    extend: {
      overflow: ['hover'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    styled: true,
    themes: true,
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: '',
    darkTheme: 'dark',
    themes: ['light', 'dark'],
    minWidth: {
      72: '18rem' /* 288px */,
      80: '20rem' /* 320px */,
      96: '24rem' /* 384px */,
    },
  },
  theme: {
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square',
    },
  },
  daisyui: {
    logs: false,
  },
};
