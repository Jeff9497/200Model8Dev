'use client';

import { useState } from 'react';
import { Brain, Zap, Cpu, Code, Crown, ChevronDown } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: 'puter' | 'groq';
  category: 'premium' | 'fast' | 'efficient';
  description: string;
  unlimited: boolean;
}

interface RateLimit {
  requests: number;
  maxRequests: number;
  resetTime: Date;
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  rateLimits: Record<string, RateLimit>;
}

export function ModelSelector({ models, selectedModel, onModelSelect, rateLimits }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getModelIcon = (modelId: string) => {
    if (modelId.includes('claude')) return <Brain className="w-4 h-4 text-purple-500" />;
    if (modelId.includes('deepseek')) return <Zap className="w-4 h-4 text-orange-500" />;
    if (modelId.includes('llama')) return <Cpu className="w-4 h-4 text-green-500" />;
    return <Code className="w-4 h-4 text-blue-500" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'premium': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'fast': return <Zap className="w-3 h-3 text-orange-500" />;
      case 'efficient': return <Cpu className="w-3 h-3 text-green-500" />;
      default: return <Code className="w-3 h-3 text-blue-500" />;
    }
  };

  const getRateLimitStatus = (modelId: string) => {
    const limit = rateLimits[modelId];
    if (!limit) return null;
    
    const percentage = (limit.requests / limit.maxRequests) * 100;
    const timeUntilReset = Math.max(0, limit.resetTime.getTime() - Date.now());
    const hoursUntilReset = Math.floor(timeUntilReset / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      percentage,
      remaining: limit.maxRequests - limit.requests,
      resetIn: hoursUntilReset > 0 ? `${hoursUntilReset}h ${minutesUntilReset}m` : `${minutesUntilReset}m`,
      isLimited: limit.requests >= limit.maxRequests
    };
  };

  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = [];
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  const selectedModelData = models.find(m => m.id === selectedModel);
  const rateLimitStatus = getRateLimitStatus(selectedModel);

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[120px] sm:min-w-[200px] max-w-[160px] sm:max-w-none"
      >
        <div className="flex items-center space-x-1 sm:space-x-2 flex-1 min-w-0">
          {selectedModelData && getModelIcon(selectedModelData.id)}
          <div className="text-left min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedModelData?.name || 'Select Model'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {selectedModelData?.unlimited ? 'Unlimited' : rateLimitStatus ? `${rateLimitStatus.remaining} left` : ''}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 sm:left-0 sm:right-auto sm:w-80 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {Object.entries(groupedModels).map(([category, categoryModels]) => (
            <div key={category} className="p-2">
              <div className="flex items-center space-x-2 px-2 py-1 mb-2">
                {getCategoryIcon(category)}
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {category === 'premium' ? 'Premium (Unlimited)' :
                   category === 'fast' ? 'Fast (Limited)' :
                   'Efficient (Limited)'}
                </h4>
              </div>

              {categoryModels.map((model) => {
                const modelRateLimit = getRateLimitStatus(model.id);
                const isSelected = selectedModel === model.id;
                const isDisabled = modelRateLimit?.isLimited;

                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      if (!isDisabled) {
                        onModelSelect(model.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={isDisabled}
                    className={`w-full p-2 rounded text-left transition-all ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getModelIcon(model.id)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {model.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {model.unlimited ? (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded">
                            Unlimited
                          </span>
                        ) : modelRateLimit ? (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {modelRateLimit.isLimited ? (
                              <span className="text-red-600 dark:text-red-400">Rate limited</span>
                            ) : (
                              <span>{modelRateLimit.remaining} left</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
