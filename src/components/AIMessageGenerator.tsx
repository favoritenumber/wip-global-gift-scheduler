import React, { useState } from 'react';
import { MessageSquare, Sparkles, Copy, RefreshCw, Heart, Star, Zap } from 'lucide-react';

interface AIMessageGeneratorProps {
  recipientName: string;
  eventType: string;
  relationship: string;
  onMessageSelect: (message: string) => void;
}

const AIMessageGenerator: React.FC<AIMessageGeneratorProps> = ({
  recipientName,
  eventType,
  relationship,
  onMessageSelect
}) => {
  const [selectedTone, setSelectedTone] = useState('warm');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([]);

  const tones = [
    { id: 'warm', label: 'Warm & Caring', icon: Heart },
    { id: 'formal', label: 'Formal & Respectful', icon: Star },
    { id: 'casual', label: 'Casual & Friendly', icon: Zap },
    { id: 'romantic', label: 'Romantic & Loving', icon: Heart },
    { id: 'professional', label: 'Professional', icon: Star }
  ];

  const generateMessages = () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const messages = generateAIMessages(recipientName, eventType, relationship, selectedTone);
      setGeneratedMessages(messages);
      setIsGenerating(false);
    }, 1500);
  };

  const generateAIMessages = (name: string, event: string, relationship: string, tone: string) => {
    const baseMessages = {
      birthday: {
        warm: [
          `Dear ${name}, on your special day, I want you to know how much joy you bring to everyone around you. May your birthday be filled with love, laughter, and all the happiness you deserve. Happy Birthday! 🎉`,
          `Happy Birthday, ${name}! Your kindness and beautiful spirit make the world a better place. Wishing you a year filled with wonderful surprises and endless joy. You deserve all the happiness in the world! ✨`,
          `To the amazing ${name}, on your birthday, I'm reminded of all the wonderful moments we've shared. You have such a beautiful heart and I'm so grateful to have you in my life. Happy Birthday! 🎂`
        ],
        formal: [
          `Dear ${name}, I extend my warmest wishes on your birthday. May this special day bring you joy, health, and prosperity. Happy Birthday.`,
          `Happy Birthday, ${name}. I hope your day is filled with happiness and that the year ahead brings you success and fulfillment.`,
          `On your birthday, ${name}, I wish you all the best. May this year bring you new opportunities and wonderful experiences.`
        ],
        casual: [
          `Hey ${name}! Happy Birthday! 🎉 Hope you have an awesome day filled with fun and laughter. You're the best!`,
          `Happy Birthday, ${name}! 🎂 Wishing you a day full of smiles and a year full of amazing adventures!`,
          `Yo ${name}! It's your birthday! 🎊 Time to celebrate and have some fun. You deserve it!`
        ]
      },
      anniversary: {
        warm: [
          `Dear ${name}, on this special anniversary, I'm reminded of the beautiful journey you've shared. Your love story inspires us all. May your love continue to grow stronger with each passing year. 💕`,
          `Happy Anniversary, ${name}! Your commitment to each other is truly beautiful. Wishing you many more years of love, laughter, and wonderful memories together. ❤️`,
          `To ${name}, on your anniversary, I celebrate the love you've built together. Your relationship is a testament to what true love looks like. Here's to many more years of happiness! 🥂`
        ],
        formal: [
          `Dear ${name}, congratulations on your anniversary. May your partnership continue to flourish and bring you both great happiness.`,
          `Happy Anniversary, ${name}. I wish you continued success in your relationship and many more years of shared joy.`,
          `On your anniversary, ${name}, I extend my best wishes for continued happiness and prosperity in your relationship.`
        ],
        romantic: [
          `My dearest ${name}, on our anniversary, my heart is full of love for you. Every day with you is a gift I cherish deeply. I love you more than words can express. 💖`,
          `Happy Anniversary, my love ${name}! You are my everything, my today, my tomorrow, my forever. I fall in love with you more each day. ❤️`,
          `To my beloved ${name}, on our special day, I want you to know that you are my greatest blessing. I love you with all my heart and soul. 💕`
        ]
      },
      graduation: {
        warm: [
          `Dear ${name}, congratulations on your graduation! 🎓 Your hard work and dedication have paid off, and I'm so proud of everything you've accomplished. The future is bright for someone as talented as you!`,
          `Happy Graduation, ${name}! 🎉 This is such an exciting milestone in your life. You've worked so hard to get here, and I can't wait to see all the amazing things you'll accomplish next.`,
          `Congratulations, ${name}! 🎓 Graduation day is here, and you've earned every bit of this success. Your determination and passion are truly inspiring. Here's to your bright future!`
        ],
        formal: [
          `Dear ${name}, congratulations on your graduation. Your academic achievements reflect your dedication and commitment to excellence. I wish you continued success in your future endeavors.`,
          `Happy Graduation, ${name}. Your hard work and perseverance have led to this well-deserved achievement. I extend my best wishes for your future success.`,
          `Congratulations, ${name}, on your graduation. Your academic accomplishments are commendable, and I wish you prosperity in your future career.`
        ]
      },
      thank_you: {
        warm: [
          `Dear ${name}, thank you from the bottom of my heart. Your kindness and generosity mean so much to me. I'm truly grateful to have you in my life. 💝`,
          `Thank you, ${name}! Your thoughtfulness and generosity have touched my heart deeply. I appreciate you more than words can express. 🙏`,
          `Dear ${name}, I want to express my deepest gratitude. Your kindness has made such a difference in my life, and I'm so thankful for you. ❤️`
        ],
        formal: [
          `Dear ${name}, I extend my sincere gratitude for your generosity. Your kindness is greatly appreciated and will not be forgotten.`,
          `Thank you, ${name}, for your thoughtful gesture. Your generosity is deeply appreciated, and I am grateful for your kindness.`,
          `Dear ${name}, I wish to express my heartfelt thanks for your generosity. Your kindness is sincerely appreciated.`
        ]
      }
    };

    const eventKey = event.toLowerCase().includes('birthday') ? 'birthday' :
                    event.toLowerCase().includes('anniversary') ? 'anniversary' :
                    event.toLowerCase().includes('graduation') ? 'graduation' :
                    event.toLowerCase().includes('thank') ? 'thank_you' : 'birthday';

    const toneMessages = baseMessages[eventKey]?.[tone] || baseMessages.birthday.warm;
    
    // Return 3 different messages
    return toneMessages.slice(0, 3);
  };

  const copyToClipboard = (message: string) => {
    navigator.clipboard.writeText(message);
    // You could add a toast notification here
  };

  React.useEffect(() => {
    if (recipientName && eventType) {
      generateMessages();
    }
  }, [recipientName, eventType, relationship, selectedTone]);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Message Generator</h3>
              <p className="text-purple-100 text-sm">Smart, personalized messages for your gifts</p>
            </div>
          </div>
          <button
            onClick={generateMessages}
            disabled={isGenerating}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 text-white ${isGenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tone Selection */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Message Tone</h4>
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => {
            const Icon = tone.icon;
            return (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedTone === tone.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tone.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generated Messages */}
      <div className="p-6">
        {isGenerating ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Generating Messages...</h4>
            <p className="text-gray-600">AI is crafting personalized messages for you</p>
          </div>
        ) : generatedMessages.length > 0 ? (
          <div className="space-y-4">
            {generatedMessages.map((message, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed">{message}</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        AI Generated
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {selectedTone} tone
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => copyToClipboard(message)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onMessageSelect(message)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Use Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Messages Generated</h4>
            <p className="text-gray-600">Select a recipient and event type to generate messages</p>
          </div>
        )}
      </div>

      {/* AI Features Info */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span>AI analyzes relationship, event type, and tone to create personalized messages</span>
        </div>
      </div>
    </div>
  );
};

export default AIMessageGenerator; 