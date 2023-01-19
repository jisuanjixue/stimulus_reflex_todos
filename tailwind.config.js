module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js',
    './app/frontend/components/**/*.rb',
    './app/frontend/components/**/*.html.erb',
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
    // eslint-disable-next-line no-dupe-keys
    logs: false,
    prefix: '',
    darkTheme: 'dark',
    // eslint-disable-next-line no-dupe-keys
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
};
