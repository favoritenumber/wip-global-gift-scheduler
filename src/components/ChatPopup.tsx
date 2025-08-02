import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Gift, Users, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

type ChatMode = 'idle' | 'add_gift' | 'add_person';
type GiftStep = 'recipient' | 'eventType' | 'eventDate' | 'giftAmount' | 'personalMessage' | 'confirm';
type PersonStep = 'name' | 'relationship' | 'birthday' | 'confirm';

const initialBotMessage = {
  id: '1',
  type: 'bot' as const,
  content: "Hi! I'm your Gift Scheduler Assistant. I can help you add gifts or people. What would you like to do?",
  timestamp: new Date(),
};

const ChatPopup: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialBotMessage]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<ChatMode>('idle');
  const [giftStep, setGiftStep] = useState<GiftStep>('recipient');
  const [personStep, setPersonStep] = useState<PersonStep>('name');
  const [giftData, setGiftData] = useState<any>({});
  const [personData, setPersonData] = useState<any>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);
  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  const addMessage = (content: string, type: 'user' | 'bot') => {
    setMessages(prev => [...prev, { id: Date.now().toString(), type, content, timestamp: new Date() }]);
  };

  const resetChat = () => {
    setMessages([initialBotMessage]);
    setMode('idle');
    setGiftStep('recipient');
    setPersonStep('name');
    setGiftData({});
    setPersonData({});
    setInputValue('');
  };

  // --- Conversational AI logic ---
  const handleUserInput = async (input: string) => {
    addMessage(input, 'user');
    setIsProcessing(true);
    const lower = input.toLowerCase();
    // Cancel or restart
    if (['cancel', 'start over', 'restart'].includes(lower)) {
      addMessage('Okay, conversation reset. What would you like to do next?', 'bot');
      resetChat();
      setIsProcessing(false);
      return;
    }
    // Mode selection
    if (mode === 'idle') {
      if (lower.includes('gift')) {
        setMode('add_gift');
        setGiftStep('recipient');
        setGiftData({});
        addMessage('Great! Who is the gift for? (Enter their name)', 'bot');
        setIsProcessing(false);
        return;
      }
      if (lower.includes('person') || lower.includes('contact') || lower.includes('friend')) {
        setMode('add_person');
        setPersonStep('name');
        setPersonData({});
        addMessage("Let's add a new person! What's their name?", 'bot');
        setIsProcessing(false);
        return;
      }
      addMessage("I can help you add a gift or a person. Type 'add gift' or 'add person' to begin.", 'bot');
      setIsProcessing(false);
      return;
    }
    // Guided gift flow
    if (mode === 'add_gift') {
      if (giftStep === 'recipient') {
        setGiftData((d: any) => ({ ...d, recipient: input }));
        setGiftStep('eventType');
        addMessage('What is the occasion? (e.g., Birthday, Anniversary)', 'bot');
        setIsProcessing(false);
        return;
      }
      if (giftStep === 'eventType') {
        setGiftData((d: any) => ({ ...d, eventType: input }));
        setGiftStep('eventDate');
        addMessage('When is the event? (YYYY-MM-DD)', 'bot');
        setIsProcessing(false);
        return;
      }
      if (giftStep === 'eventDate') {
        setGiftData((d: any) => ({ ...d, eventDate: input }));
        setGiftStep('giftAmount');
        addMessage('What type of gift? ($5, $25, $50, $100)', 'bot');
        setIsProcessing(false);
        return;
      }
      if (giftStep === 'giftAmount') {
        setGiftData((d: any) => ({ ...d, giftAmount: input }));
        setGiftStep('personalMessage');
        addMessage('Any personal message to include? (or type "skip")', 'bot');
        setIsProcessing(false);
        return;
      }
      if (giftStep === 'personalMessage') {
        setGiftData((d: any) => ({ ...d, personalMessage: input === 'skip' ? '' : input }));
        setGiftStep('confirm');
        addMessage(`Please confirm:
Recipient: ${giftData.recipient}
Occasion: ${giftData.eventType}
Date: ${giftData.eventDate}
Amount: ${giftData.giftAmount}
Message: ${input === 'skip' ? '(none)' : input}
Type 'yes' to save or 'cancel' to abort.`, 'bot');
        setIsProcessing(false);
        return;
      }
      if (giftStep === 'confirm') {
        if (lower === 'yes' || lower === 'y') {
          // Save to Supabase
          try {
            let recipientId = null;
            const { data: existingPerson } = await supabase
              .from('people')
              .select('id')
              .eq('user_id', user.id)
              .eq('name', giftData.recipient)
              .single();
            if (existingPerson) {
              recipientId = existingPerson.id;
            } else {
              const { data: newPerson, error: personError } = await supabase
                .from('people')
                .insert({ user_id: user.id, name: giftData.recipient })
                .select('id')
                .single();
              if (personError) throw personError;
              recipientId = newPerson.id;
            }
            const { error: giftError } = await supabase
              .from('gifts')
              .insert({
                user_id: user.id,
                recipient_id: recipientId,
                relationship: 'Friend',
                event_type: giftData.eventType,
                event_date: new Date(giftData.eventDate).toISOString(),
                gift_amount: giftData.giftAmount,
                personal_message: giftData.personalMessage,
                photo_url: '',
                status: 'not-started',
              });
            if (giftError) throw giftError;
            addMessage('✅ Gift created successfully! Type anything to start over.', 'bot');
            setMode('idle');
            setGiftStep('recipient');
            setGiftData({});
          } catch (e) {
            addMessage('❌ Sorry, there was an error saving the gift. Please try again.', 'bot');
          }
          setIsProcessing(false);
          return;
        } else {
          addMessage('Gift creation cancelled. Type anything to start over.', 'bot');
          setMode('idle');
          setGiftStep('recipient');
          setGiftData({});
          setIsProcessing(false);
          return;
        }
      }
    }
    // Guided person flow
    if (mode === 'add_person') {
      if (personStep === 'name') {
        setPersonData((d: any) => ({ ...d, name: input }));
        setPersonStep('relationship');
        addMessage('What is your relationship? (e.g., Friend, Family, Colleague)', 'bot');
        setIsProcessing(false);
        return;
      }
      if (personStep === 'relationship') {
        setPersonData((d: any) => ({ ...d, relationship: input }));
        setPersonStep('birthday');
        addMessage('When is their birthday? (YYYY-MM-DD, or type "skip")', 'bot');
        setIsProcessing(false);
        return;
      }
      if (personStep === 'birthday') {
        setPersonData((d: any) => ({ ...d, birthday: input === 'skip' ? null : input }));
        setPersonStep('confirm');
        addMessage(`Please confirm:
Name: ${personData.name}
Relationship: ${personData.relationship}
Birthday: ${input === 'skip' ? '(none)' : input}
Type 'yes' to save or 'cancel' to abort.`, 'bot');
        setIsProcessing(false);
        return;
      }
      if (personStep === 'confirm') {
        if (lower === 'yes' || lower === 'y') {
          try {
            const { error } = await supabase
              .from('people')
              .insert({
                user_id: user.id,
                name: personData.name,
                nickname: null,
                birthday: personData.birthday ? new Date(personData.birthday).toISOString() : null,
                anniversary: null,
                address: null,
              });
            if (error) throw error;
            addMessage('✅ Person added successfully! Type anything to start over.', 'bot');
            setMode('idle');
            setPersonStep('name');
            setPersonData({});
          } catch (e) {
            addMessage('❌ Sorry, there was an error saving the person. Please try again.', 'bot');
          }
          setIsProcessing(false);
          return;
        } else {
          addMessage('Person creation cancelled. Type anything to start over.', 'bot');
          setMode('idle');
          setPersonStep('name');
          setPersonData({});
          setIsProcessing(false);
          return;
        }
      }
    }
    // Fallback
    addMessage("I'm not sure what you mean. Type 'add gift' or 'add person' to begin.", 'bot');
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    await handleUserInput(inputValue.trim());
    setInputValue('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Assistant</h3>
                  <p className="text-blue-100 text-sm">Ready to help!</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">AI</Badge>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 text-blue-600" />}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isProcessing}
                aria-label="Chat input"
              />
              <Button type="submit" size="sm" disabled={!inputValue.trim() || isProcessing} className="bg-blue-600 hover:bg-blue-700">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={resetChat} className="ml-2" title="Restart chat">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPopup;