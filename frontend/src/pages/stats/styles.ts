export const styles = {
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
  content: 'max-w-7xl mx-auto px-6 py-8',
  
  header: 'flex justify-between items-start mb-10',
  title: 'text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3',
  subtitle: 'text-gray-600 text-lg',
  trainButton: 'px-8 py-4 btn-hover',
  
  loadingContainer: 'flex flex-col items-center justify-center min-h-96',
  spinner: 'animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600',
  loadingText: 'mt-6 text-xl text-gray-600 font-medium',
  
  errorMessage: 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 font-medium',
  
  statsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10',
  statCard: 'p-6 bg-white rounded-2xl shadow-soft border border-gray-100 card-hover',
  statContent: 'flex items-center space-x-4',
  statIcon: 'flex-shrink-0 p-3 rounded-xl',
  statLabel: 'text-sm font-semibold text-gray-600 uppercase tracking-wide',
  statValue: 'text-3xl font-bold text-gray-900',
  
  sentimentIcon: 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500',
  stabilityIcon: 'bg-gradient-to-r from-blue-500 to-purple-500',
  
  chartsGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10',
  chartCard: 'p-8 bg-white rounded-2xl shadow-soft border border-gray-100',
  chartTitle: 'text-2xl font-bold text-gray-900 mb-6',
  chartContainer: 'w-full',
  
  insightsCard: 'p-8 bg-white rounded-2xl shadow-soft border border-gray-100',
  insightsTitle: 'text-2xl font-bold text-gray-900 mb-6',
  insightsContent: 'space-y-4',
  insightItem: 'flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0',
  insightLabel: 'text-lg font-semibold text-gray-600',
  insightValue: 'text-lg font-bold text-gray-900',
};

