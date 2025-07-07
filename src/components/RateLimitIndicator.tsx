'use client';

import { Clock, Infinity, AlertTriangle } from 'lucide-react';

interface RateLimit {
  requests: number;
  maxRequests: number;
  resetTime: Date;
}

interface RateLimitIndicatorProps {
  model: string;
  limits: Record<string, RateLimit>;
}

export function RateLimitIndicator({ model, limits }: RateLimitIndicatorProps) {
  const limit = limits[model];
  
  // Claude models (via Puter.js) have unlimited usage
  if (model.includes('claude')) {
    return (
      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
        <Infinity className="w-4 h-4" />
        <span className="text-xs font-medium">Unlimited</span>
      </div>
    );
  }
  
  // If no limit data available, show loading
  if (!limit) {
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <div className="w-4 h-4 animate-pulse bg-gray-300 rounded"></div>
        <span className="text-xs">Loading...</span>
      </div>
    );
  }
  
  const percentage = (limit.requests / limit.maxRequests) * 100;
  const remaining = limit.maxRequests - limit.requests;
  const timeUntilReset = Math.max(0, limit.resetTime.getTime() - Date.now());
  const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
  
  const isLimited = limit.requests >= limit.maxRequests;
  const isNearLimit = percentage > 80;
  
  const getStatusColor = () => {
    if (isLimited) return 'text-red-600 dark:text-red-400';
    if (isNearLimit) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };
  
  const getProgressColor = () => {
    if (isLimited) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="flex items-center space-x-2">
      {isLimited ? (
        <AlertTriangle className="w-4 h-4 text-red-500" />
      ) : (
        <Clock className="w-4 h-4 text-gray-500" />
      )}
      
      <div className="flex flex-col items-end">
        <div className={`text-xs font-medium ${getStatusColor()}`}>
          {isLimited ? (
            `Resets in ${hoursUntilReset > 0 ? `${hoursUntilReset}h ` : ''}${minutesUntilReset}m`
          ) : (
            `${remaining} left`
          )}
        </div>
        
        <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
