export const styles = {
  container: 'min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
  content: 'max-w-4xl mx-auto px-6 py-8',
  
  header: 'mb-10 text-center',
  title: 'text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4',
  subtitle: 'text-gray-600 text-lg',
  
  formCard: 'max-w-3xl mx-auto',
  form: 'space-y-8',
  
  titleInput: 'w-full',
  contentInput: 'w-full',
  
  analysisSection: 'border-t-2 border-gray-200 pt-8',
  analyzeButton: 'mb-6',
  
  sentimentResult: 'bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200',
  sentimentInfo: 'flex items-center space-x-6 mb-4',
  sentimentLabel: 'text-lg font-semibold text-gray-700',
  sentimentValue: 'text-lg font-bold capitalize px-4 py-2 rounded-xl',
  confidenceLabel: 'text-lg font-semibold text-gray-700',
  confidenceValue: 'text-lg font-mono font-bold text-blue-600',
  methodInfo: 'text-sm text-gray-500 font-medium',
  
  sentimentColors: {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  },
  
  errorMessage: 'text-red-600 text-sm bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200 font-medium',
  
  buttonGroup: 'flex justify-end space-x-4 pt-6',
  cancelButton: 'px-8 py-3 btn-hover',
  submitButton: 'px-8 py-3 btn-hover',
};

