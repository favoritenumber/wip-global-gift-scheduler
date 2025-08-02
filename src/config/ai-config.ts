// AI Configuration for Global Gift Scheduler
// This file contains configuration for different AI providers

export interface AIConfig {
  provider: 'openai' | 'gemini' | 'claude' | 'local';
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Default configuration
export const defaultAIConfig: AIConfig = {
  provider: 'local', // Start with local AI features
  model: 'gpt-4',
  maxTokens: 500,
  temperature: 0.7
};

// OpenAI Configuration
export const openAIConfig: AIConfig = {
  provider: 'openai',
  model: 'gpt-4',
  maxTokens: 500,
  temperature: 0.7
};

// Google Gemini Configuration
export const geminiConfig: AIConfig = {
  provider: 'gemini',
  model: 'gemini-pro',
  maxTokens: 500,
  temperature: 0.7
};

// Anthropic Claude Configuration
export const claudeConfig: AIConfig = {
  provider: 'claude',
  model: 'claude-3-sonnet-20240229',
  maxTokens: 500,
  temperature: 0.7
};

// AI Feature Prompts
export const aiPrompts = {
  messageGeneration: {
    system: `You are an expert gift message writer. Create personalized, heartfelt messages for gifts based on the relationship, event type, and tone requested. Make messages warm, personal, and appropriate for the occasion.`,
    user: (recipientName: string, eventType: string, relationship: string, tone: string) => 
      `Write a ${tone} message for ${recipientName}'s ${eventType}. The relationship is ${relationship}. Make it personal and heartfelt.`
  },
  
  giftRecommendation: {
    system: `You are an expert gift advisor. Analyze the recipient's information and suggest appropriate gifts based on the relationship, occasion, and budget. Consider personalization and thoughtfulness.`,
    user: (recipientName: string, eventType: string, relationship: string, budget: string) =>
      `Suggest a thoughtful gift for ${recipientName}'s ${eventType}. Relationship: ${relationship}, Budget: ${budget}. Consider their interests and make it personal.`
  },
  
  reminderOptimization: {
    system: `You are a smart reminder system. Analyze gift timing and suggest optimal reminder schedules based on gift complexity, relationship importance, and user behavior patterns.`,
    user: (eventType: string, daysUntil: number, relationship: string) =>
      `Optimize reminder timing for ${eventType} in ${daysUntil} days. Relationship: ${relationship}. Consider gift complexity and importance.`
  }
};

// AI Feature Categories
export const aiFeatureCategories = {
  immediate: [
    'Smart Gift Recommendations',
    'AI Message Generation', 
    'Smart Reminders',
    'Basic Chatbot Support'
  ],
  shortTerm: [
    'Predictive Analytics',
    'Advanced Personalization',
    'Smart Bundling',
    'Enhanced Customer Service'
  ],
  longTerm: [
    'AR/VR Integration',
    'Advanced AI Features',
    'Full Automation',
    'Predictive Everything'
  ]
};

// Expected Impact Metrics
export const aiImpactMetrics = {
  smartRecommendations: { min: 25, max: 40, unit: '%' },
  giftBundling: { min: 15, max: 30, unit: '%' },
  personalization: { min: 20, max: 35, unit: '%' },
  predictiveFeatures: { min: 30, max: 50, unit: '%' },
  overall: { min: 50, max: 100, unit: '%' }
};

// API Rate Limits and Costs
export const apiLimits = {
  openai: {
    rateLimit: '3 requests per minute',
    costPerRequest: '$0.03',
    maxTokens: 4000
  },
  gemini: {
    rateLimit: '15 requests per minute',
    costPerRequest: '$0.01',
    maxTokens: 8000
  },
  claude: {
    rateLimit: '5 requests per minute', 
    costPerRequest: '$0.015',
    maxTokens: 4000
  }
};

// Local AI Features (No API required)
export const localAIFeatures = [
  'Smart Gift Recommendations based on existing data',
  'Intelligent Reminders with priority levels',
  'Basic Message Templates with tone selection',
  'Gift History Analysis and insights',
  'Relationship-based gift suggestions',
  'Budget optimization recommendations',
  'Event timing analysis',
  'Personalization scoring'
];

// Environment Variables for API Keys
export const requiredEnvVars = {
  openai: ['OPENAI_API_KEY'],
  gemini: ['GOOGLE_GEMINI_API_KEY'],
  claude: ['ANTHROPIC_API_KEY']
};

export default {
  defaultAIConfig,
  openAIConfig,
  geminiConfig,
  claudeConfig,
  aiPrompts,
  aiFeatureCategories,
  aiImpactMetrics,
  apiLimits,
  localAIFeatures,
  requiredEnvVars
}; 