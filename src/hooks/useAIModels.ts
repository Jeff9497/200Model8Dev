'use client';

import { useState, useEffect } from 'react';

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

export function useAIModels() {
  const [models, setModels] = useState<Model[]>([]);
  const [rateLimits, setRateLimits] = useState<Record<string, RateLimit>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize models
    const availableModels: Model[] = [
      // Premium Models (Puter.js - Unlimited)
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'puter',
        category: 'premium',
        description: 'Best for complex coding tasks',
        unlimited: true
      },
      {
        id: 'claude-3-7-sonnet',
        name: 'Claude 3.7 Sonnet',
        provider: 'puter',
        category: 'premium',
        description: 'Latest Claude model for debugging',
        unlimited: true
      },
      
      // Fast Models (Groq - Limited)
      {
        id: 'deepseek-r1-distill-llama-70b',
        name: 'DeepSeek R1 Distill Llama 70B',
        provider: 'groq',
        category: 'fast',
        description: 'Excellent reasoning for debugging',
        unlimited: false
      },
      {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B Versatile',
        provider: 'groq',
        category: 'fast',
        description: 'Great general coding capabilities',
        unlimited: false
      },
      {
        id: 'llama3-70b-8192',
        name: 'Llama 3 70B',
        provider: 'groq',
        category: 'fast',
        description: 'Solid coding performance',
        unlimited: false
      },

      
      // Efficient Models (Groq - Limited)
      {
        id: 'llama-3.1-8b-instant',
        name: 'Llama 3.1 8B Instant',
        provider: 'groq',
        category: 'efficient',
        description: 'Super fast for simple debugging',
        unlimited: false
      },
      {
        id: 'gemma2-9b-it',
        name: 'Gemma 2 9B',
        provider: 'groq',
        category: 'efficient',
        description: 'Lightweight coding assistance',
        unlimited: false
      }
    ];

    setModels(availableModels);
    
    // Initialize rate limits for Groq models
    const initialRateLimits: Record<string, RateLimit> = {};
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    availableModels.forEach(model => {
      if (model.provider === 'groq') {
        // Different models have different rate limits
        let maxRequests = 2000; // Default

        switch (model.id) {
          case 'llama3-70b-8192':
            maxRequests = 14400; // 14.4k requests/day
            break;
          case 'mistral-saba-24b':
            maxRequests = 1000; // 1k requests/day
            break;
          case 'deepseek-r1-distill-llama-70b':
            maxRequests = 1000; // 1k requests/day
            break;
          case 'llama-3.3-70b-versatile':
            maxRequests = 1000; // 1k requests/day
            break;
          case 'llama-3.1-8b-instant':
            maxRequests = 14400; // 14.4k requests/day
            break;
          case 'gemma2-9b-it':
            maxRequests = 14400; // 14.4k requests/day
            break;
          default:
            maxRequests = 2000;
        }

        // Get stored rate limit data from localStorage
        const stored = localStorage.getItem(`rateLimit_${model.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            initialRateLimits[model.id] = {
              ...parsed,
              maxRequests, // Update with current limits
              resetTime: new Date(parsed.resetTime)
            };
          } catch (e) {
            // If parsing fails, use default
            initialRateLimits[model.id] = {
              requests: 0,
              maxRequests,
              resetTime: tomorrow
            };
          }
        } else {
          initialRateLimits[model.id] = {
            requests: 0,
            maxRequests,
            resetTime: tomorrow
          };
        }
      }
    });
    
    setRateLimits(initialRateLimits);
    setIsLoading(false);
  }, []);

  // Save rate limits to localStorage whenever they change
  useEffect(() => {
    Object.entries(rateLimits).forEach(([modelId, limit]) => {
      localStorage.setItem(`rateLimit_${modelId}`, JSON.stringify({
        ...limit,
        resetTime: limit.resetTime.toISOString()
      }));
    });
  }, [rateLimits]);

  const updateRateLimit = (modelId: string, increment: number = 1) => {
    setRateLimits(prev => {
      const current = prev[modelId];
      if (!current) return prev;
      
      // Check if we need to reset (new day)
      const now = new Date();
      if (now >= current.resetTime) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return {
          ...prev,
          [modelId]: {
            requests: increment,
            maxRequests: current.maxRequests,
            resetTime: tomorrow
          }
        };
      }
      
      return {
        ...prev,
        [modelId]: {
          ...current,
          requests: Math.min(current.requests + increment, current.maxRequests)
        }
      };
    });
  };

  const canUseModel = (modelId: string): boolean => {
    const model = models.find(m => m.id === modelId);
    if (!model) return false;
    
    // Claude models are unlimited
    if (model.unlimited) return true;
    
    // Check Groq rate limits
    const limit = rateLimits[modelId];
    if (!limit) return true; // If no limit data, assume available
    
    return limit.requests < limit.maxRequests;
  };

  const getAlternativeModels = (currentModelId: string): Model[] => {
    const currentModel = models.find(m => m.id === currentModelId);
    if (!currentModel) return [];
    
    // If current model is limited, suggest unlimited Claude models
    if (!currentModel.unlimited) {
      return models.filter(m => m.unlimited);
    }
    
    // If current model is unlimited, suggest other available models
    return models.filter(m => 
      m.id !== currentModelId && 
      (m.unlimited || canUseModel(m.id))
    );
  };

  return {
    models,
    rateLimits,
    isLoading,
    updateRateLimit,
    canUseModel,
    getAlternativeModels
  };
}
