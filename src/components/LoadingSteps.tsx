export function LoadingSteps() {
  return (
    <div className="w-full max-w-md mx-auto p-8 text-center">
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-4">
            <div className="relative">
                <div className="w-3 h-3 bg-black dark:bg-white rounded-full animate-ping absolute inset-0 opacity-75"></div>
                <div className="w-3 h-3 bg-black dark:bg-white rounded-full relative"></div>
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200 animate-pulse">
                Analyzing your profile...
            </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>We're scanning your recent posts for products.</p>
          <p>This usually takes about 10-20 seconds.</p>
        </div>
      </div>
    </div>
  );
}

