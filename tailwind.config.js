export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    fontFamily: { display: ['Outfit', 'sans-serif'], body: ['"Plus Jakarta Sans"', 'sans-serif'] },
    keyframes: {
      float: { '0%,100%': { transform: 'translateY(0) rotate(0)' }, '50%': { transform: 'translateY(-26px) rotate(6deg)' } },
      pop: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
    },
    animation: { float: 'float 7s ease-in-out infinite', 'float-slow': 'float 11s ease-in-out infinite', pop: 'pop .5s ease both' },
  } },
};
