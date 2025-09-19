export const styles = {
  base: 'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 active:scale-95',
  
  variants: {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-blue-500 shadow-md hover:shadow-lg',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 rounded-lg',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 focus:ring-red-500 shadow-lg hover:shadow-xl',
  },
  
  sizes: {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  },
  
  disabled: 'opacity-50 cursor-not-allowed transform-none hover:scale-100',
  loading: 'cursor-wait transform-none hover:scale-100',
  
  spinner: 'animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full',
  loadingText: 'opacity-70',
};

