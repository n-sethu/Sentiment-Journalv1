export const styles = {
  container: 'card-hover group',
  
  header: 'flex justify-between items-start mb-6',
  titleSection: 'flex-1',
  title: 'text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300',
  dateTime: 'flex flex-col space-y-2 text-right',
  date: 'text-sm text-gray-600 font-semibold',
  time: 'text-xs text-gray-500',
  actions: 'flex space-x-2',
  actionButton: 'p-3 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-gray-600',
  
  content: 'mb-6',
  text: 'text-gray-700 leading-relaxed whitespace-pre-wrap text-lg line-clamp-4',
  
  footer: 'border-t border-gray-100 pt-4',
  moodSection: 'flex justify-between items-center',
  moodIndicator: 'flex items-center space-x-3',
  moodLabel: 'text-sm font-semibold capitalize px-3 py-1 rounded-full',
  moodColors: {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  },
  moodIcon: {
    positive: 'w-5 h-5 text-green-600',
    negative: 'w-5 h-5 text-red-600',
    neutral: 'w-5 h-5 text-gray-600',
  },
  sentimentScore: 'flex items-center space-x-2',
  scoreLabel: 'text-xs text-gray-500 font-medium',
  score: 'text-sm font-mono font-bold text-blue-600',
};

