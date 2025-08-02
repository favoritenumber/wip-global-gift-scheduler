import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Gift, Clock, TrendingUp, Brain, Zap } from 'lucide-react';

interface AIFeaturesProps {
  allPeople: any[];
  allEvents: any[];
  onSelectGift: (giftData: any) => void;
}

const AIFeatures: React.FC<AIFeaturesProps> = ({ allPeople, allEvents, onSelectGift }) => {
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [smartReminders, setSmartReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // AI-powered gift recommendations based on existing data
  const generateAIRecommendations = () => {
    const recommendations = [];
    
    // Analyze gift history patterns
    const giftHistory = allEvents.reduce((acc: any, event: any) => {
      const key = `${event.relationship}_${event.event_type}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event.gift_amount);
      return acc;
    }, {});

    // Generate recommendations for each person
    allPeople.forEach(person => {
      const personEvents = allEvents.filter(event => event.recipient_name === person.name);
      
      if (personEvents.length === 0) {
        // New person - suggest based on relationship and upcoming dates
        const upcomingBirthday = person.birthday ? new Date(person.birthday) : null;
        const upcomingAnniversary = person.anniversary ? new Date(person.anniversary) : null;
        
        if (upcomingBirthday && upcomingBirthday > new Date()) {
          const daysUntilBirthday = Math.ceil((upcomingBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilBirthday <= 30) {
            recommendations.push({
              type: 'birthday',
              person: person.name,
              event: 'Birthday',
              date: upcomingBirthday,
              daysUntil: daysUntilBirthday,
              suggestedGift: getSuggestedGift(person, 'Birthday'),
              confidence: 0.95,
              reason: `Birthday coming up in ${daysUntilBirthday} days`
            });
          }
        }
        
        if (upcomingAnniversary && upcomingAnniversary > new Date()) {
          const daysUntilAnniversary = Math.ceil((upcomingAnniversary.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilAnniversary <= 30) {
            recommendations.push({
              type: 'anniversary',
              person: person.name,
              event: 'Anniversary',
              date: upcomingAnniversary,
              daysUntil: daysUntilAnniversary,
              suggestedGift: getSuggestedGift(person, 'Anniversary'),
              confidence: 0.90,
              reason: `Anniversary coming up in ${daysUntilAnniversary} days`
            });
          }
        }
      } else {
        // Existing person - analyze patterns and suggest improvements
        const lastGift = personEvents[personEvents.length - 1];
        const giftValue = getGiftValue(lastGift.gift_amount);
        
        // Suggest upgrade if last gift was low value
        if (giftValue < 25) {
          recommendations.push({
            type: 'upgrade',
            person: person.name,
            event: 'Next Occasion',
            suggestedGift: getUpgradedGift(lastGift.gift_amount),
            confidence: 0.85,
            reason: 'Consider upgrading from your last gift'
          });
        }
      }
    });

    setAiRecommendations(recommendations);
  };

  // Smart reminders based on gift status and timing
  const generateSmartReminders = () => {
    const reminders = [];
    
    allEvents.forEach(event => {
      const eventDate = new Date(event.event_date);
      const now = new Date();
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // High priority reminders
      if (daysUntil <= 3 && event.status === 'not-started') {
        reminders.push({
          type: 'urgent',
          person: event.recipient_name,
          event: event.event_type,
          date: eventDate,
          daysUntil,
          message: `🚨 Urgent: ${event.recipient_name}'s ${event.event_type} is in ${daysUntil} days!`,
          priority: 'high'
        });
      }
      
      // Medium priority reminders
      if (daysUntil <= 10 && daysUntil > 3 && event.status === 'not-started') {
        reminders.push({
          type: 'upcoming',
          person: event.recipient_name,
          event: event.event_type,
          date: eventDate,
          daysUntil,
          message: `📅 ${event.recipient_name}'s ${event.event_type} is coming up in ${daysUntil} days`,
          priority: 'medium'
        });
      }
      
      // Early planning reminders
      if (daysUntil <= 30 && daysUntil > 10 && event.status === 'not-started') {
        reminders.push({
          type: 'planning',
          person: event.recipient_name,
          event: event.event_type,
          date: eventDate,
          daysUntil,
          message: `💡 Start planning ${event.recipient_name}'s ${event.event_type} (${daysUntil} days away)`,
          priority: 'low'
        });
      }
    });

    setSmartReminders(reminders);
  };

  const getSuggestedGift = (person: any, eventType: string) => {
    // AI logic for gift suggestions based on relationship and event
    const relationship = person.relationship || 'Friend';
    const event = eventType.toLowerCase();
    
    if (event.includes('birthday')) {
      if (relationship === 'Family' || relationship === 'Parent') {
        return 'Thoughtful Present ($50)';
      } else if (relationship === 'Friend') {
        return 'Sweet Something ($25)';
      }
    } else if (event.includes('anniversary')) {
      return 'Generous Gesture ($100)';
    } else if (event.includes('graduation')) {
      return 'Thoughtful Present ($50)';
    }
    
    return 'Sweet Something ($25)';
  };

  const getUpgradedGift = (currentGift: string) => {
    const giftMap: { [key: string]: string } = {
      'Personal Note and photo ($5)': 'Sweet Something ($25)',
      'Sweet Something ($25)': 'Thoughtful Present ($50)',
      'Thoughtful Present ($50)': 'Generous Gesture ($100)',
      'Generous Gesture ($100)': 'Generous Gesture ($100)'
    };
    return giftMap[currentGift] || 'Sweet Something ($25)';
  };

  const getGiftValue = (giftAmount: string) => {
    const valueMap: { [key: string]: number } = {
      'Personal Note and photo ($5)': 5,
      'Sweet Something ($25)': 25,
      'Thoughtful Present ($50)': 50,
      'Generous Gesture ($100)': 100
    };
    return valueMap[giftAmount] || 0;
  };

  useEffect(() => {
    generateAIRecommendations();
    generateSmartReminders();
  }, [allPeople, allEvents]);

  const handleCreateGift = (recommendation: any) => {
    onSelectGift({
      recipient_name: recommendation.person,
      event_type: recommendation.event,
      event_date: recommendation.date ? recommendation.date.toISOString().split('T')[0] : '',
      gift_amount: recommendation.suggestedGift,
      relationship: 'Friend' // Default, can be enhanced
    });
  };

  return (
    <div className="space-y-8">
      {/* AI Features Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Features</h2>
            <p className="text-purple-100">Smart recommendations and intelligent insights</p>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">Smart Gift Recommendations</h3>
          </div>
        </div>
        
        <div className="p-6">
          {aiRecommendations.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No AI Recommendations Yet</h4>
              <p className="text-gray-600">Add people and gifts to get personalized AI recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiRecommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-blue-600">{rec.person}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {rec.confidence * 100}% confidence
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{rec.reason}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>🎁 {rec.suggestedGift}</span>
                        {rec.daysUntil && (
                          <span>📅 {rec.daysUntil} days away</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateGift(rec)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Create Gift
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Smart Reminders */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">Smart Reminders</h3>
          </div>
        </div>
        
        <div className="p-6">
          {smartReminders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h4>
              <p className="text-gray-600">No urgent reminders at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {smartReminders.slice(0, 5).map((reminder, index) => (
                <div 
                  key={index} 
                  className={`border rounded-xl p-4 ${
                    reminder.priority === 'high' 
                      ? 'border-red-200 bg-red-50' 
                      : reminder.priority === 'medium'
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-semibold text-gray-900">{reminder.person}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          reminder.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : reminder.priority === 'medium'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {reminder.priority} priority
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{reminder.message}</p>
                      <div className="text-sm text-gray-600">
                        📅 {reminder.event} - {reminder.daysUntil} days away
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateGift(reminder)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Create Gift
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {allPeople.length}
              </div>
              <div className="text-sm text-gray-600">People in your network</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {allEvents.length}
              </div>
              <div className="text-sm text-gray-600">Gifts scheduled</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {allEvents.filter(e => e.status === 'not-started').length}
              </div>
              <div className="text-sm text-gray-600">Pending gifts</div>
            </div>
          </div>
          
          {allEvents.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3">💡 AI Suggestions</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {allEvents.length < 5 && (
                  <li>• Consider adding more people to expand your gift network</li>
                )}
                {allEvents.filter(e => e.gift_amount === 'Personal Note and photo ($5)').length > allEvents.length * 0.7 && (
                  <li>• Try upgrading some gifts to increase impact and value</li>
                )}
                {allEvents.filter(e => !e.personal_message).length > 0 && (
                  <li>• Add personal messages to make your gifts more meaningful</li>
                )}
                {allEvents.filter(e => !e.photo_url).length > 0 && (
                  <li>• Include photos to make your gifts more personal</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFeatures; 