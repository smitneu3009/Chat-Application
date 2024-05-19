// craco.config.cjs
module.exports = {
  style: {
      postcss: {
          plugins: [
              require('tailwindcss'),
              require('autoprefixer'),
          ],
      },
  },
};
