import { Loader2, ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo/Brand */}
        <div className="relative">
          <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-600" />
          <Loader2 className="animate-spin w-6 h-6 absolute -top-1 -right-1 text-blue-600" />
        </div>
        
        {/* Loading text */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Loading...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we prepare your content
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
