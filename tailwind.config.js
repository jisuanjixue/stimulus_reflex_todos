module.exports = {
  content: [
    './node_modules/flowbite/**/*.js',
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
    require('flowbite/plugin'),
  ],
  theme: {
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square',
    },
  },
};
